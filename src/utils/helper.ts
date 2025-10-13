import bcrypt from 'bcryptjs';
import { Plans, SubscriptionDuration } from '../generated/prisma';
import { getEmailQueue } from '../jobs/queue/emailQueue';
import { SubscriptionReminderEmail } from './emailTemplate/subscriptionReminder';
import { stripe } from './stripe';
import { STRIPE_PRICE_IDS } from './stripePriceId';
import crypto from 'crypto';

export const generateOtp = () => {
  return Math.floor(10000 + Math.random() * 90000);
};

export const comparedPassword = async ({
  candidatePassword,
  password,
}: {
  candidatePassword: string;
  password: string;
}): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, password);
};

export const generateSubscriptionCycleId = (
  subscriptionId: string,
  periodStart: Date
): string => {
  return `${subscriptionId}_${periodStart.getTime()}`;
};

export const scheduleSubscriptionReminders = async ({
  subscriptionId,
  endDate,
  userEmail,
  userName,
  planName,
}: {
  subscriptionId: string;
  endDate: Date;
  userEmail: string;
  userName: string;
  planName: Plans;
}): Promise<{ type: string; jobId: string }[]> => {
  const emailQueue = getEmailQueue();
  const now = new Date();

  const ThreeDaysbeforeEnd = new Date(
    endDate.getTime() - 3 * 24 * 60 * 60 * 1000
  );

  const ADaybeforeEnd = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

  const jobIds: { type: string; jobId: string }[] = [];

  try {
    if (ThreeDaysbeforeEnd > now) {
      const html = SubscriptionReminderEmail({
        userName: userName,
        planName,
        endDate,
        subscriptionId,
        days: 3,
      });

      const threeDayJob = await emailQueue.add(
        'email',
        {
          to: userEmail,
          subject: 'Subscription Reminder',
          body: html,
        },
        {
          delay: ThreeDaysbeforeEnd.getTime() - Date.now(),
        }
      );

      if (threeDayJob.id) {
        jobIds.push({ type: '5days_email', jobId: threeDayJob.id });
      }
    }

    if (ADaybeforeEnd > now) {
      const html = SubscriptionReminderEmail({
        userName,
        subscriptionId,
        planName,
        endDate,
        days: 1,
      });
      const oneDayJob = await emailQueue.add(
        'email',
        {
          to: userEmail,
          subject: 'Subscription Reminder',
          body: html,
        },
        {
          delay: ADaybeforeEnd.getTime() - Date.now(),
        }
      );

      if (oneDayJob.id) {
        jobIds.push({ type: '1day_email', jobId: oneDayJob.id });
      }
    }

    return jobIds;
  } catch (error: any) {
    console.error(
      `Error scheduling reminder jobs for subscription ${subscriptionId}:`,
      error
    );
    return [];
  }
};

export const getStripePeriodDates = async (stripeSubId: string) => {
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

  return {
    startDate: new Date(stripeSub.items.data[0].current_period_start * 1000),
    endDate: new Date(stripeSub.items.data[0].current_period_end * 1000),
    subscription: stripeSub,
  };
};

export function getPlanDetailsFromPriceId(priceId: string) {
  for (const [type, durations] of Object.entries(STRIPE_PRICE_IDS)) {
    for (const [duration, id] of Object.entries(durations)) {
      if (id === priceId) {
        return {
          subscriptionType: type as Plans,
          subscriptionDuration: duration as SubscriptionDuration,
        };
      }
    }
  }

  throw new Error('Price ID not found in STRIPE_PRICE_IDS');
}

export async function cancelSubscriptionReminders({
  existingJobId,
}: {
  existingJobId: { type: string; jobId: string }[];
}) {
  const emailJob = getEmailQueue();

  let cancelledCount = 0;

  for (const jobInfo of existingJobId) {
    try {
      const job = await emailJob.getJob(jobInfo.jobId);
      if (job) {
        await job.remove();
        cancelledCount++;
      }
    } catch (error) {
      console.error(`Error cancelling job ${jobInfo.jobId}:`, error);
    }
  }

  return cancelledCount;
}

export function generateIdempotencyKey(
  action: string,
  data: Record<string, any>
): string {
  const serialized = JSON.stringify(data, Object.keys(data).sort());
  const hash = crypto.createHash('sha256').update(serialized).digest('hex');
  return `${action}_${hash}`;
}
