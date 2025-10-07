import Stripe from 'stripe';
import { getConfig } from '../config/config';
import { Request, Response } from 'express';
import { stripe } from '../utils/stripe';
import { prisma } from '../config/prismaConfig';
import { BillingStatus, SubscriptionStatus } from '../generated/prisma';
import {
  cancelSubscriptionReminders,
  generateSubscriptionCycleId,
  getPlanDetailsFromPriceId,
  getStripePeriodDates,
  scheduleSubscriptionReminders,
} from '../utils/helper';
import { getPlanDetials } from '../utils/subscription.utils';
import { getEmailQueue } from '../jobs/queue/emailQueue';
import { AppError } from '../utils/appError';
import { trialStartEmail } from '../utils/emailTemplate/trialSubscriptionEmail';
import { paymentReceiptEmail } from '../utils/emailTemplate/paymentReciptEmail';
import { paymentFailEmail } from '../utils/emailTemplate/paymentFailEmail';
import { subscriptionCancelEmail } from '../utils/emailTemplate/subscriptionCancelEmail';
import { mapStripeStatusToInternal } from '../utils/stripePriceId';

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

async function handleInVoicePaid(invoice: Stripe.Invoice) {
  let stripeSubId = (invoice as any).subscription as string | undefined;

  if (!stripeSubId && invoice.lines?.data?.length) {
    stripeSubId = invoice.lines.data[0].subscription as string;
  }

  if (!stripeSubId) {
    console.error('No subscription ID on invoice', invoice.id);
    return;
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: stripeSubId,
      },
      include: {
        reminderJobs: true,
      },
    });

    if (!subscription) {
      console.error('No local subscription for', stripeSubId);
      return;
    }

    const {
      startDate,
      endDate,
      subscription: stripeSub,
    } = await getStripePeriodDates(stripeSubId);

    if (stripeSub.status === 'trialing') {
      console.log(
        'Invoice paid, but subscription is still in trial — skipping activation.'
      );
      return;
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: subscription.organizationId,
      },
    });

    if (!organization) {
      console.log('Unable to find organization');
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: organization.ownerId,
      },
    });

    if (!user) {
      console.log('Unable to find user');
      return;
    }

    const newSubscription = getPlanDetailsFromPriceId(
      stripeSub.items.data[0].price.id
    );

    const planInfo = getPlanDetials({
      plan: newSubscription.subscriptionType,
      duration: newSubscription.subscriptionDuration,
    });

    const subscriptionCycleId = generateSubscriptionCycleId(
      stripeSub.id,
      new Date(invoice.lines.data[0].period.start)
    );

    // Cancel existing reminder jobs before scheduling new ones

    if (subscription.reminderJobs && subscription.reminderJobs.length > 0) {
      await cancelSubscriptionReminders({
        existingJobId: subscription.reminderJobs,
      });

      await prisma.reminderJob.deleteMany({
        where: {
          subscriptionId: subscription.id,
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      const newJobId = await scheduleSubscriptionReminders({
        subscriptionId: subscription.id,
        endDate: endDate,
        userEmail: user.email,
        userName: user.firstName,
        planName: subscription.subscriptionType,
      });

      const updatedSubcription = await tx.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          subscriptionCycleId,
        },
      });

      const existingSubscriptionFeature =
        await tx.subscriptionFeatures.findFirst({
          where: {
            subscriptionId: updatedSubcription.id,
          },
        });

      if (existingSubscriptionFeature) {
        await tx.subscriptionFeatures.update({
          where: {
            subscriptionId: updatedSubcription.id,
          },
          data: {
            maxWorkers: planInfo.maxWorkers,
            maxProjects: planInfo.maxProjects,
            maxTasks: planInfo.maxTasks,
          },
        });
      } else {
        await tx.subscriptionFeatures.create({
          data: {
            subscriptionId: updatedSubcription.id,
            maxWorkers: planInfo.maxWorkers,
            maxProjects: planInfo.maxProjects,
            maxTasks: planInfo.maxTasks,
          },
        });
      }

      await tx.billingHistory.create({
        data: {
          subscriptionId: updatedSubcription.id,
          billingDate: new Date(invoice.created * 1000),
          amount: (invoice.amount_paid ?? 0) / 100,
          paymentMethod: 'card',
          transactionId: invoice.id || '',
          status: BillingStatus.PAID,
        },
      });

      for (const job of newJobId) {
        await tx.reminderJob.create({
          data: {
            subscriptionId: updatedSubcription.id,
            type: job.type,
            jobId: job.jobId,
          },
        });
      }

      const checkExistingPackageRecord = await tx.packageRecord.findFirst({
        where: {
          organizationId: updatedSubcription.organizationId,
          subscriptionId: stripeSubId,
        },
      });

      if (!checkExistingPackageRecord) {
        const packageRecord = await tx.packageRecord.create({
          data: {
            organizationId: updatedSubcription.organizationId,
            subscriptionId: stripeSubId,
            periodStart: updatedSubcription.startDate,
            periodEnd: updatedSubcription.endDate,
            isTrial: false,
            subscriptionCycleId: updatedSubcription.subscriptionCycleId || '',
          },
        });

        if (!packageRecord) {
          console.error('Unable to create package error for user');
          return;
        }
      }
    });

    try {
      const emailQueue = getEmailQueue();
      const html = paymentReceiptEmail({
        customerName: user.firstName,
        planName: subscription.subscriptionType,
        amountPaid: (invoice.amount_paid ?? 0) / 100,
        transactionId: invoice.id,
        billingDate: new Date(invoice.created * 1000).toDateString(),
        invoiceUrl: invoice.hosted_invoice_url || '',
      });

      await emailQueue.add('email', {
        to: user.email,
        body: html,
        subject: 'Billing update',
      });
    } catch (error: any) {
      console.log('error while sending email');
      return;
    }
  } catch (error: any) {
    console.error('Error handling paid invoice:', invoice.id, error.message);
    throw error;
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  let stripeSubId = (invoice as any).subscription as string | undefined;

  if (!stripeSubId && invoice.lines.data.length) {
    stripeSubId = invoice.lines.data[0].subscription as string;
  }

  if (!stripeSubId) {
    console.error('No subscription ID on invoice', invoice);
    return;
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: stripeSubId,
      },
    });

    if (!subscription) {
      console.error('No local subscription for', stripeSubId);
      return;
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: subscription.organizationId,
      },
    });

    if (!organization) {
      console.error('Unable to find user organization');
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: organization.ownerId,
      },
    });

    if (!user) {
      console.error('Unable to find user');
      return;
    }

    let attempts = 0;

    await prisma.$transaction(async (tx) => {
      const updatedSubcription = await tx.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: SubscriptionStatus.PAST_DUE,
        },
      });

      const findDunning = await tx.dunning.findFirst({
        where: {
          subscriptionId: updatedSubcription.id,
        },
      });

      if (findDunning) {
        const dunning = await tx.dunning.update({
          where: {
            subscriptionId: updatedSubcription.id,
          },
          data: {
            lastAttemptAt: new Date(),
            attempts: { increment: 1 },
          },
        });

        attempts = dunning.attempts;
      } else {
        const dunning = await tx.dunning.create({
          data: {
            subscriptionId: updatedSubcription.id,
            lastAttemptAt: new Date(),
            attempts: 1,
          },
        });

        attempts = dunning.attempts;
      }
    });

    const subject =
      attempts === 1
        ? "Payment failed - we'll retry"
        : `Payment failed again ${attempts} - update your card`;

    try {
      const emailQueue = getEmailQueue();

      const html = paymentFailEmail({
        customerName: user.firstName,
        planName: subscription.subscriptionType,
        billingDate: new Date(invoice.created * 1000).toDateString(),
        maxAttempts: 4,
        attempts: attempts,
        year: new Date().getFullYear(),
      });

      await emailQueue.add('email', {
        to: user.email,
        body: html,
        subject,
      });
    } catch (error) {
      console.error('unable to send email');
      return;
    }
  } catch (error: any) {
    console.error(
      'Error handling payment_failed invoice:',
      invoice.id,
      error.message
    );
    throw error;
  }
}

async function handleFinalFailure(invoice: Stripe.Invoice) {
  let stripeSubId = (invoice as any).subscription as string | undefined;

  if (!stripeSubId && invoice.lines.data.length) {
    stripeSubId = invoice.lines.data[0].subscription as string;
  }

  if (!stripeSubId) {
    console.error('No subscription ID or invoice', invoice);
    return;
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: stripeSubId,
      },
    });

    if (!subscription) {
      console.error('Unable to find user subscription');
      return;
    }

    const organization = await prisma.organization.findFirst({
      where: {
        id: subscription.organizationId,
      },
    });

    if (!organization) {
      console.error('Unable to find user organization');
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: organization.ownerId,
      },
    });

    if (!user) {
      console.error('Unable to find user');
      return;
    }

    const updateSubscription = await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelRequested: false,
      },
    });

    await prisma.dunning.update({
      where: {
        subscriptionId: updateSubscription.id,
      },
      data: {
        finalFailedAt: new Date(invoice.created * 1000),
      },
    });

    try {
      const emailQueue = getEmailQueue();
      const html = subscriptionCancelEmail({
        customerName: user.firstName,
        planName: subscription.subscriptionType,
        cancellationReason: 'due to failed payment attempts',
        cancelDate: new Date(invoice.created * 1000).toDateString(),
      });

      await emailQueue.add('email', {
        to: user.email,
        body: html,
        subject: 'Subscription cancelled - payment failed',
      });
    } catch (error: any) {
      console.error('Unable to send email', error);
    }
  } catch (error: any) {
    console.error(
      'Error handling final payment fail invoice:',
      invoice.id,
      error.message
    );
    throw error;
  }
}

async function handleSubcriptionDeleted(stripeSub: Stripe.Subscription) {
  const stripeSubId = stripeSub.id;

  const subscription = await prisma.subscription.findFirst({
    where: {
      stripeSubscriptionId: stripeSubId,
    },
    include: {
      reminderJobs: true,
    },
  });

  if (!subscription) {
    console.error('No local subscription for', stripeSubId);
    return;
  }

  if (subscription.reminderJobs && subscription.reminderJobs.length > 0) {
    await cancelSubscriptionReminders({
      existingJobId: subscription.reminderJobs,
    });

    await prisma.reminderJob.deleteMany({
      where: {
        subscriptionId: subscription.id,
      },
    });
  }

  const organization = await prisma.organization.findFirst({
    where: {
      id: subscription.organizationId,
    },
  });

  if (!organization) {
    console.error('unable to find organization');
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: organization.ownerId,
    },
  });

  if (!user) {
    console.error('Unable to find user');
    return;
  }

  try {
    const updateSubscription = await prisma.subscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: stripeSub.cancel_at
          ? new Date(stripeSub.cancel_at * 1000)
          : new Date(),
        cancelRequested: false,
      },
    });

    if (!updateSubscription) {
      console.error('unable to update subscription');
      return;
    }

    await prisma.reminderJob.deleteMany({
      where: {
        subscriptionId: subscription.id,
      },
    });

    try {
      const emailQueue = getEmailQueue();
      const html = subscriptionCancelEmail({
        customerName: user.firstName,
        planName: subscription.subscriptionType,
        cancellationReason: subscription.cancellationReason || '',
        cancelDate: new Date(
          (stripeSub.cancel_at as number) * 1000
        ).toDateString(),
      });

      await emailQueue.add('email', {
        to: user.email,
        body: html,
        subject: 'Subscription Cancellation',
      });
    } catch (error: any) {
      console.error('Unable to send email', error);
    }

    console.log(
      `Successfully processed subscription cancellation: ${stripeSubId}`
    );
  } catch (error: any) {
    console.error(
      'Error handling subscription delete event:',
      stripeSubId,
      error.message
    );
    throw error;
  }
}

async function handleSubscriptionUpdate(stripeSub: Stripe.Subscription) {
  const stripeSubId = stripeSub.id;

  const subscription = await prisma.subscription.findFirst({
    where: {
      stripeSubscriptionId: stripeSubId,
    },
    include: {
      reminderJobs: true,
    },
  });

  if (!subscription) {
    console.error('No Local subscription for', stripeSubId);
    return;
  }

  const newSubscription = getPlanDetailsFromPriceId(
    stripeSub.items.data[0].price.id
  );

  const planInfo = getPlanDetials({
    plan: newSubscription.subscriptionType,
    duration: newSubscription.subscriptionDuration,
  });

  const organization = await prisma.organization.findFirst({
    where: {
      id: subscription.organizationId,
    },
  });

  if (!organization) {
    console.error('Unable to find organization');
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: organization.ownerId,
    },
  });

  if (!user) {
    console.error('Unable to find user');
    return;
  }

  if (subscription.reminderJobs && subscription.reminderJobs.length > 0) {
    await cancelSubscriptionReminders({
      existingJobId: subscription.reminderJobs,
    });

    await prisma.reminderJob.deleteMany({
      where: {
        subscriptionId: subscription.id,
      },
    });
  }

  const newJobId = await scheduleSubscriptionReminders({
    subscriptionId: subscription.id,
    endDate: new Date(stripeSub.items.data[0].current_period_end * 1000),
    userEmail: user.email,
    userName: user.firstName,
    planName: newSubscription.subscriptionType,
  });

  try {
    await prisma.$transaction(async (tx) => {
      const updateSubscription = await tx.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: mapStripeStatusToInternal(stripeSub.status),
          subscriptionType: newSubscription.subscriptionType,
          price: planInfo.price,
          subscriptionDuration: newSubscription.subscriptionDuration,
          startDate: new Date(
            stripeSub.items.data[0].current_period_start * 1000
          ),
          endDate: new Date(stripeSub.items.data[0].current_period_end * 1000),
        },
      });

      await tx.subscriptionFeatures.update({
        where: {
          subscriptionId: subscription.id,
        },
        data: {
          maxProjects: planInfo.maxProjects,
          maxTasks: planInfo.maxTasks,
          maxWorkers: planInfo.maxWorkers,
        },
      });

      newJobId.map(async (job) => {
        await tx.reminderJob.create({
          data: {
            subscriptionId: subscription.id,
            jobId: job.jobId,
            type: job.type,
          },
        });
      });

      console.log(`Successfully processed subscription update: ${stripeSubId}`);
    });
  } catch (error: any) {
    console.error(
      'Error handling subscription update event:',
      stripeSubId,
      error.message
    );
    throw error;
  }
}

export const handleStripeWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event;

  console.log(config.stripe.stripe_webhook_secret);

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
        break;
      case 'invoice.paid':
        await handleInVoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.finalization_failed':
        await handleFinalFailure(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await handleSubcriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }

    res.status(200).json({
      received: true,
      eventType: event.type,
      eventId: event.id,
    });
  } catch (error: any) {
    console.error('⚠️ Webhook handler error:', error);
    res.status(500).send('Internal handler error');
  }
};
