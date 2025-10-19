import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prismaConfig';
import { AppError } from '../utils/appError';
import { getPlanDetials } from '../utils/subscription.utils';
import {
  SubscriptionStatus,
  Organization,
  MembershipRole,
  User,
} from '@prisma/client';
import { STRIPE_PRICE_IDS } from '../utils/stripePriceId';
import { getConfig } from '../config/config';
import { stripe } from '../utils/stripe';

const config = getConfig();

export const OrganizationSubscriptionCheck = async (
  organizationId: Organization['id']
) => {
  try {
    const organization = await prisma.organization.findFirst({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!organization) {
      throw new AppError('Unable to find organization', 404);
    }

    const subscription = organization.subscription;

    if (!subscription) {
      throw new AppError(
        'Organization does not have a subscription record',
        400
      );
    }

    if (subscription.status === SubscriptionStatus.PENDING) {
      const planDetails = getPlanDetials({
        plan: subscription.subscriptionType,
        duration: subscription.subscriptionDuration,
      });

      const stripe_price_id =
        STRIPE_PRICE_IDS[subscription.subscriptionType][
          subscription.subscriptionDuration
        ];

      const url =
        config.env === 'production'
          ? config.backendUrl
          : 'http://localhost:8000';

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: subscription.stripeCustomerId,
        line_items: [{ price: stripe_price_id, quantity: 1 }],
        subscription_data: { trial_period_days: planDetails.trialDays },
        success_url: `${url}${config.apiPrefix}/organization/${organization.id}/billing/success`,
        cancel_url: `${url}${config.apiPrefix}/organization/${organization.id}/billing/cancel`,
        metadata: {
          organizationId: organization.id,
          userId: organization.ownerId,
        },
      });

      // ❌ Don't send response — instead throw a handled AppError with details
      throw new AppError(
        'Please add payment method to start your subscription trial, use the url provided below to add a payment method and start your free trial',
        402,
        { url: session.url }
      );
    }

    if (
      subscription.status !== SubscriptionStatus.ACTIVE &&
      subscription.status !== SubscriptionStatus.TRIALING
    ) {
      throw new AppError(
        'Your organization does not have an active subscription plan, please check your subscription section for more information',
        403
      );
    }

    return true;
  } catch (error: any) {
    throw new AppError(error, 500);
  }
};

export const OrganizationRestrict = async (
  userId: User['id'],
  organizationId: Organization['id'],
  ...roles: MembershipRole[]
) => {
  try {
    console.log(userId, organizationId);
    const member = await prisma.membership.findFirst({
      where: {
        organizationId: organizationId,
        userId,
      },
    });

    console.log(member, 'member');

    if (!member) {
      throw new AppError(
        'Unable to find membership for this organization. Please check if you are still a member.',
        404
      );
    }

    if (!roles.includes(member.role)) {
      throw new AppError(
        "You don't have permission to perform this action",
        403
      );
    }

    return true;
  } catch (error: any) {
    throw new AppError(error, 500);
  }
};
