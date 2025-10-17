import { Queue } from 'bullmq';
import { getConfig } from '../../config/config';

const config = getConfig();
let expiringInviteQueue: Queue | null = null;

const bullmqConnection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
};

export const getExpiringInviteQueue = () => {
  if (!expiringInviteQueue) {
    expiringInviteQueue = new Queue('expiringInvite', {
      connection: bullmqConnection,
      defaultJobOptions: {
        ...config.bullmq.defaultJobOptions,
      },
    });
  }

  return expiringInviteQueue;
};
