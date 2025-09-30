import bcrypt from 'bcryptjs';
import { Plans } from '../generated/prisma';
import { getEmailQueue } from '../jobs/queue/emailQueue';
import { SubscriptionReminderEmail } from './emailTemplate/subscriptionReminder';

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
