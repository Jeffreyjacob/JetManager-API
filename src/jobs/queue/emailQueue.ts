import { Queue, RedisConnection } from 'bullmq';
import { getConfig } from '../../config/config';
import Redis from 'ioredis';

const config = getConfig();
let emailQueue: Queue | null = null;

const redisConnection = new Redis(config.redis.host, {
  tls: config.redis.host.startsWith('rediss://')
    ? { rejectUnauthorized: false }
    : undefined,
  maxRetriesPerRequest: null,
});

export const getEmailQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue('email', {
      connection: redisConnection,
      defaultJobOptions: {
        ...config.bullmq.defaultJobOptions,
      },
    });
  }

  return emailQueue;
};
