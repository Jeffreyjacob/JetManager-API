import { prisma } from './config/prismaConfig';
import { createEmailWorker } from './jobs/workers/emaiWorker';

const startWorker = async () => {
  try {
    await prisma.$connect();
    const emailWorker = createEmailWorker();
    console.log('👷 Worker process started and connected to Redis');

    emailWorker.on('ready', () => console.log('Email worker connected'));
    emailWorker.on('error', (err) => {
      console.error('Email worker error', err);
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
