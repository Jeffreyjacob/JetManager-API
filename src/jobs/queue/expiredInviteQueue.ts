import { Queue, RedisConnection } from 'bullmq';
import { getConfig } from '../../config/config';
import Redis from 'ioredis';

const config = getConfig();
let expiringInviteQueue: Queue | null = null;

const redisConnection = new Redis(config.redis.host, {
  tls: config.redis.host.startsWith('rediss://')
    ? { rejectUnauthorized: false }
    : undefined,
  maxRetriesPerRequest: null,
});

export const getExpiringInviteQueue = () => {
  if (!expiringInviteQueue) {
    expiringInviteQueue = new Queue('expiringInvite', {
      connection: redisConnection,
      defaultJobOptions: {
        ...config.bullmq.defaultJobOptions,
      },
    });
  }

  return expiringInviteQueue;
};
