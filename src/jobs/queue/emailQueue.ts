import { Queue } from 'bullmq';
import { getConfig } from '../../config/config';

const config = getConfig();
let emailQueue: Queue | null = null;

const bullmqConnection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
};

export const getEmailQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue('email', {
      connection: bullmqConnection,
      defaultJobOptions: {
        ...config.bullmq.defaultJobOptions,
      },
    });
  }

  return emailQueue;
};
