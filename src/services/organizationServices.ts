import { IOrganizationMutation } from '../interfaces/interface';
import { User } from '../generated/prisma';
import { prisma } from '../config/prismaConfig';
import { AppError } from '../utils/appError';
import { stripe } from '../utils/stripe';
import { getPlanDetials } from '../utils/subscription.utils';
import { SubscriptionStatus } from '../generated/prisma';
import { STRIPE_PRICE_IDS } from '../utils/stripePriceId';
import { getConfig } from '../config/config';
import { getEmailQueue } from '../jobs/queue/emailQueue';

const config = getConfig();
export class OrganizationServices {
  async createOrganization({
    userId,
    data,
  }: {
    userId: User['id'];
    data: IOrganizationMutation['create'];
  }) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError('Unable to found user', 404);
    }

    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name: data.name,
        ownerId: userId,
      },
    });

    if (existingOrganization) {
      throw new AppError('organization with this name already exist', 400);
    }

    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        ownerId: userId,
      },
    });

    const stripeCustomer = await stripe.customers.create({
      name: user.firstName,
      email: user.email,
    });

    const planDetails = getPlanDetials({
      plan: data.subscriptionType,
      duration: data.subscriptionDuration,
    });

    const today = new Date();
    const endTrialDay = new Date(
      today.setDate(today.getDate() + planDetails.trialDays)
    );

    const stripe_price_id =
      STRIPE_PRICE_IDS[data.subscriptionType][data.subscriptionDuration];

    const subscription = await prisma.subscription.create({
      data: {
        organizationId: organization.id,
        subscriptionType: data.subscriptionType,
        subscriptionDuration: data.subscriptionDuration,
        status: SubscriptionStatus.PENDING,
        startDate: today,
        endDate: endTrialDay,
        price: planDetails.price,
        stripeCustomerId: stripeCustomer.id,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomer.id,
      line_items: [{ price: stripe_price_id, quantity: 1 }],
      subscription_data: {
        trial_period_days: planDetails.trialDays,
      },
      success_url: `http://localhost:8000${config.apiPrefix}/org/${organization.id}/billing/success`,
      cancel_url: `http://localhost:8000${config.apiPrefix}/org/${organization.id}/billing/cancel`,
      metadata: {
        organizationId: organization.id,
        userId: user.id,
      },
    });

    return {
      url: session.url,
    };
  }
}
