import Stripe from 'stripe';
import { getConfig } from '../config/config';
import { Request, Response } from 'express';
import { stripe } from '../utils/stripe';
import { prisma } from '../config/prismaConfig';
import { SubscriptionStatus } from '../generated/prisma';
import {
  generateSubscriptionCycleId,
  scheduleSubscriptionReminders,
} from '../utils/helper';
import { getPlanDetials } from '../utils/subscription.utils';
import { getEmailQueue } from '../jobs/queue/emailQueue';
import { AppError } from '../utils/appError';
import { trialStartEmail } from '../utils/emailTemplate/trialSubscriptionEmail';

const config = getConfig();

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const sessions = event.data.object as Stripe.Checkout.Session;
  const { organizationId, userId } = sessions.metadata!;
  const subscriptionId = sessions.subscription as string;
  const customerId = sessions.customer as string;

  if (!organizationId) {
    console.error('No organization id found in session metadata');
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const subscriptionCycleId = generateSubscriptionCycleId(
      subscriptionId,
      new Date(subscription.items.data[0].current_period_start)
    );

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      console.log('user not found');
      return;
    }

    const subscriptionModel = await prisma.subscription.findFirst({
      where: {
        stripeCustomerId: customerId,
        organizationId: organizationId,
      },
    });

    if (!subscriptionModel) {
      console.log('Unable to find subscription model');
      return;
    }

    const planDetails = getPlanDetials({
      plan: subscriptionModel.subscriptionType,
      duration: subscriptionModel.subscriptionDuration,
    });

    await prisma.$transaction(async (tx) => {
      const updatedSub = await tx.subscription.update({
        where: {
          stripeCustomerId: customerId,
          organizationId: organizationId,
        },
        data: {
          stripeSubscriptionId: subscriptionId,
          status: subscription.status.toUpperCase() as SubscriptionStatus,
          startDate: new Date(
            subscription.items.data[0].current_period_start * 1000
          ),
          endDate: new Date(
            subscription.items.data[0].current_period_end * 1000
          ),
          subscriptionCycleId,
        },
      });

      await tx.subscriptionFeatures.create({
        data: {
          subscriptionId: subscriptionModel.id,
          maxWorkers: planDetails.maxWorkers,
          maxProjects: planDetails.maxProjects,
          maxTasks: planDetails.maxTasks,
        },
      });

      await tx.activity.create({
        data: {
          action: 'SUBSCRIPTION_CREATED',
          organizationId: organizationId,
          userId: userId,
        },
      });

      await tx.packageRecord.create({
        data: {
          organizationId: organizationId,
          subscriptionId: subscriptionModel.id,
          periodStart: updatedSub.startDate,
          periodEnd: updatedSub.endDate,
          isTrial: true,
          subscriptionCycleId: updatedSub.subscriptionCycleId || '',
        },
      });

      // schedule subscription reminder

      const newJobIds = await scheduleSubscriptionReminders({
        subscriptionId: subscriptionModel.id,
        endDate: updatedSub.endDate,
        userEmail: user.email,
        userName: user.firstName,
        planName: updatedSub.subscriptionType,
      });

      // updated reminderId on subscription model

      newJobIds.map(async (job) => {
        await prisma.reminderJob.create({
          data: {
            subscriptionId: subscriptionModel.id,
            type: job.type,
            jobId: job.jobId,
          },
        });
      });
    });

    // send email to user about their trial

    const html = trialStartEmail({
      customerName: user.firstName,
      planName: subscriptionModel.subscriptionType,
      trialDays: planDetails.trialDays,
      trialEndDate: new Date(subscriptionModel.endDate).toDateString(),
    });

    try {
      const emailQueue = getEmailQueue();
      emailQueue.add('email', {
        to: user.email,
        subject: 'Subscription Updated',
        body: html,
      });
    } catch (error: any) {
      console.error('Error adding job to queue:', error);
      throw new AppError('Failed to send verification email', 500);
    }

    console.log(`Successfully processed checkout session`, sessions.id);
  } catch (error: any) {
    console.error(
      'Error handling checkout session',
      sessions.id,
      error.message
    );
    throw error;
  }
}

export const handleStripeWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event;

  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = config.stripe.stripe_webhook_secret as string;

    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error: any) {
    console.log(`Payment webhook signature verification failed`, error);
    return res.status(400).send(`Payment webhook Error: ${error}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
    }
  } catch (error: any) {}
};
