import Stripe from 'stripe';
import { prisma } from '../config/prismaConfig';
import {
  Organization,
  Plans,
  SubscriptionStatus,
  User,
} from '../generated/prisma';
import {
  ISubscriptionMutation,
  SubscriptionSwitchEnum,
} from '../interfaces/interface';
import { AppError } from '../utils/appError';
import { generateIdempotencyKey } from '../utils/helper';
import { stripe } from '../utils/stripe';
import { STRIPE_PRICE_IDS } from '../utils/stripePriceId';

export class SubscriptionServices {
  async cancelSubsription({
    userId,
    data,
  }: {
    userId: User['id'];
    data: ISubscriptionMutation['cancelSubscription'];
  }) {
    const organization = await prisma.organization.findFirst({
      where: {
        id: data.organizationId,
        ownerId: userId,
      },
    });

    if (!organization) {
      throw new AppError('Unable to find organization', 404);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: data.organizationId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
      },
    });

    if (!subscription) {
      throw new AppError('No active subscription found', 400);
    }

    // canceling subscription on stripe at the period end of your current subscription plan

    await stripe.subscriptions.update(subscription.stripeSubscriptionId!, {
      cancel_at_period_end: true,
    });

    const cancellationReason = data.cancellationReason && {
      cancellationReason: data.cancellationReason,
    };

    const updateSubscription = await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        cancelRequested: true,
        cancelledAt: new Date(),
        ...cancellationReason,
      },
    });

    if (!updateSubscription) {
      throw new AppError('Unable to cancel subscription', 400);
    }

    return {
      message: 'subscription has been cancelled',
    };
  }

  async resumeSubscription({
    userId,
    data,
  }: {
    userId: User['id'];
    data: ISubscriptionMutation['resumeSubscription'];
  }) {
    const organization = await prisma.organization.findFirst({
      where: {
        id: data.organizationId,
        ownerId: userId,
      },
    });

    if (!organization) {
      throw new AppError('Unable to organization', 404);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: organization.id,
        cancelRequested: true,
      },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new AppError('No cancelled subscription to resune', 400);
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        cancelRequested: false,
        cancelledAt: null,
        cancellationReason: null,
      },
    });

    if (!updatedSubscription) {
      throw new AppError('Unable to resume subscription', 400);
    }

    return {
      message: 'subscription has been resumed!',
    };
  }

  async restartSubscription({
    data,
    userId,
  }: {
    data: ISubscriptionMutation['restartSubscription'];
    userId: User['id'];
  }) {
    const organization = await prisma.organization.findFirst({
      where: {
        id: data.organizationId,
        ownerId: userId,
      },
    });

    if (!organization) {
      throw new AppError('Unable to find organization', 404);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: data.organizationId,
      },
    });

    if (!subscription) {
      throw new AppError('unable to find subscription', 400);
    }

    const priceId =
      STRIPE_PRICE_IDS[data.subscriptionType][data.subscriptionDuration];

    const existingActiveSub = await stripe.subscriptions.list({
      customer: subscription.stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    if (existingActiveSub.data.length > 0) {
      throw new AppError(
        'Cannot restart - active subscription already exists',
        400
      );
    }

    const customer = await stripe.customers.retrieve(
      subscription.stripeCustomerId
    );

    // cast the response to any (or a narrower type) so we can access invoice_settings safely
    const customerObj = customer as any;

    const default_paymentMethod = subscription.paymentMethodId
      ? subscription.paymentMethodId
      : customerObj?.invoice_settings?.default_payment_method;

    const restartKey = generateIdempotencyKey('sub_restart', {
      subscriptionId: subscription.id,
      priceId,
      paymentMethodId: default_paymentMethod,
    });

    const stripeSub = await stripe.subscriptions.create(
      {
        customer: subscription.stripeCustomerId,
        items: [{ price: priceId }],
        default_payment_method: default_paymentMethod,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice'],
        metadata: {
          organizationId: data.organizationId,
          subscriptionId: subscription.id,
        },
      },
      {
        idempotencyKey: restartKey,
      }
    );

    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        subscriptionType: data.subscriptionType,
        subscriptionDuration: data.subscriptionDuration,
        status: SubscriptionStatus.PROCESSING,
        stripeSubscriptionId: stripeSub.id,
      },
    });

    if (!updatedSubscription) {
      throw new AppError('Unable to update subscription', 400);
    }

    return {
      message: 'Your subscription has been initiated and being processed!',
    };
  }

  async changeSubscription({
    userId,
    data,
  }: {
    userId: User['id'];
    data: ISubscriptionMutation['changeSubscriptionPlan'];
  }) {
    const organization = await prisma.organization.findFirst({
      where: {
        ownerId: userId,
        id: data.organizationId,
      },
    });

    if (!organization) {
      throw new AppError('Unable to find organization found', 404);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: organization.id,
      },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new AppError('Unable to find subscription', 400);
    }

    const incomingPriceId =
      STRIPE_PRICE_IDS[data.subscriptionType][data.subscriptionDuration];

    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    const currentPriceId = stripeSub.items.data[0].price.id;

    if (currentPriceId === incomingPriceId) {
      throw new AppError(
        'You are already on this current plan, Please try switching to a different plan',
        400
      );
    }

    const itemId = stripeSub.items.data[0].id;

    const updateParams = {
      items: [{ id: itemId, price: incomingPriceId }],
      proration_behavior: (data.when === SubscriptionSwitchEnum.Now
        ? 'create_prorations'
        : 'none') as Stripe.SubscriptionUpdateParams.ProrationBehavior,
      billing_cycle_anchor: (data.when === SubscriptionSwitchEnum.Now
        ? 'now'
        : 'unchanged') as Stripe.SubscriptionUpdateParams.BillingCycleAnchor,
    };

    const idemKey = generateIdempotencyKey('plan_change', {
      subscriptionId: subscription.id,
      currentPriceId,
      newPriceId: incomingPriceId,
      when: data.when,
    });

    await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      updateParams,
      {
        idempotencyKey: idemKey,
      }
    );

    return {
      message:
        data.when === SubscriptionSwitchEnum.Now
          ? 'Plan changed immediately with proration.'
          : 'Plan will change at the end of your current plan period',
    };
  }

  async getSubsctiptoonByOrganization({
    organizationId,
  }: {
    organizationId: Organization['id'];
  }) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new AppError('Unable to find organization', 404);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: organizationId,
      },
    });

    if (!subscription) {
      throw new AppError('Unable to find subscription', 404);
    }

    return {
      data: subscription,
    };
  }
}
