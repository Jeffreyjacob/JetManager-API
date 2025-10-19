import { error } from 'console';
import { prisma } from './config/prismaConfig';
import { createEmailWorker } from './jobs/workers/emaiWorker';
import { createExpiringInviteWorker } from './jobs/workers/expiredInviteWorker';

const startWorker = async () => {
  try {
    await prisma.$connect();
    const emailWorker = createEmailWorker();
    const expiringInviteWorker = createExpiringInviteWorker();

    console.log('👷 Worker process started and connected to Rediss');

    emailWorker.on('ready', () => console.log('Email worker connected'));
    expiringInviteWorker.on('ready', () =>
      console.log('Expiring Invite worker connected')
    );
    emailWorker.on('error', (err) => {
      console.error('Email worker error', err);
    });
    expiringInviteWorker.on('error', (error) => {
      console.error('Expiring invite worker error', error);
    });

    process.on('SIGINT', async () => {
      console.log('Shutting down worker...');
      emailWorker.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error: any) {
    console.error('Worker failed to start:', error);
    process.exit(1);
  }
};

startWorker();
