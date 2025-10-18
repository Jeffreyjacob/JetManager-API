import { Job, Worker } from 'bullmq';
import { ExpiringInviteData } from '../interface/jobinterface';
import { prisma } from '../../config/prismaConfig';
import { InviteStatus } from '@prisma/client';
import { getConfig } from '../../config/config';
import Redis from 'ioredis';

const config = getConfig();

const redisConnection = new Redis(config.redis.host, {
  tls: config.redis.host.startsWith('rediss://')
    ? { rejectUnauthorized: false }
    : undefined,
  maxRetriesPerRequest: null,
});

export const createExpiringInviteWorker = () => {
  const worker = new Worker<ExpiringInviteData>(
    'expiringInvite',
    async (job: Job<ExpiringInviteData>) => {
      const { InviteId } = job.data;

      try {
        const organizationalInvite = await prisma.organizationInvite.update({
          where: {
            id: InviteId,
          },
          data: {
            status: InviteStatus.EXPIRED,
          },
        });

        return {
          success: true,
          message: `Invite Id with ${InviteId} has been updated to expired`,
        };
      } catch (error: any) {
        console.error(
          `Failed to update organization invite with id ${InviteId}:`,
          error.message
        );
      }
    },
    {
      connection: redisConnection,
      concurrency: config.bullmq.concurrency,
    }
  );

  worker.on('completed', (job) =>
    console.warn(`Expiring Invite job ${job.id} completed`)
  );

  worker.on('failed', (job, err) => {
    console.warn(`Expiring invite job ${job?.id} failed:`, err);
  });

  worker.on('progress', (job, progress) => {
    console.warn(`Expiring Invite job ${job.id} progress:`, progress);
  });

  return worker;
};
