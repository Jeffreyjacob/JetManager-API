import { Job, Worker } from 'bullmq';
import { getConfig } from '../../config/config';
import { EmailJobData } from '../interface/jobinterface';
import { AppError } from '../../utils/appError';
import { SendEmail } from '../../utils/nodeMailer';
import Redis from 'ioredis';

const config = getConfig();

const redisConnection = new Redis(config.redis.host, {
  tls: config.redis.host.startsWith('rediss://')
    ? { rejectUnauthorized: false }
    : undefined,
  maxRetriesPerRequest: null,
});

export const createEmailWorker = () => {
  const worker = new Worker<EmailJobData>(
    'email',
    async (job: Job<EmailJobData>) => {
      const { to, subject, body } = job.data;

      try {
        await SendEmail({ to, subject, html: body, text: body });
        console.log(`Email sent successfully to ${to}`);
        return { success: true, recipient: to };
      } catch (error: any) {
        console.error(`Failed to send email to ${to}:`, error.message);
        throw new AppError(error.message, 500);
      }
    },
    {
      connection: redisConnection,
      concurrency: config.bullmq.concurrency,
    }
  );

  worker.on('completed', (job) =>
    console.warn(`Email job ${job.id} completed`)
  );
  worker.on('failed', (job, err) =>
    console.error(`Email job ${job?.id} failed:`, err)
  );
  worker.on('progress', (job, progress) =>
    console.warn(`Email job ${job.id} progress: ${progress}`)
  );

  return worker;
};
