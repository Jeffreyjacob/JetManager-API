import { Application } from 'express';
import express from 'express';
import dotenv from 'dotenv';
import { getConfig, AppConfig } from './config/config';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { prisma } from './config/prismaConfig';
import { ErrorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoute';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { swaggerOptions } from './config/swaggerConfig';
import { handleStripeWebhook } from './webhooks/webhook';
import organizationRoutes from './routes/organizationRoute';

dotenv.config();

async function startServer() {
  const app: Application = express();
  const config: AppConfig = getConfig();

  app.use(
    cors({
      origin: config.security.cors.origin,
      credentials: config.security.cors.credentials,
    })
  );

  const corsOptions = {
    credentials: config.security.cors.credentials,
    origin: config.security.cors.origin,
    methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
    preflightContinue: false,
    maxAge: 86400,
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Accept-Encoding',
      'Accept-Language',
    ],
  };

  app.post(
    '/webhook/stripe',
    express.raw({ type: 'application/json' }),
    handleStripeWebhook
  );

  // app.use(cors(corsOptions));
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
  app.use(morgan('common'));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const swaggerSpec = swaggerJsDoc(swaggerOptions);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(`${config.apiPrefix}/auth`, authRoutes);
  app.use(`${config.apiPrefix}/organization`, organizationRoutes);

  app.use(ErrorHandler);

  const PORT = config.port;
  await prisma.$connect();
  app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

startServer();
