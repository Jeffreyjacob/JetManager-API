import { Application, Request, Response } from 'express';
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
import projectRoute from './routes/projectRoute';
import taskRoute from './routes/taskRoute';
import commentRoute from './routes/commentRoutes';
import subscriptionRoute from './routes/subscriptionRoutes';
import rateLimit from 'express-rate-limit';

dotenv.config();

async function startServer() {
  const app: Application = express();
  const config: AppConfig = getConfig();

  const limiter = rateLimit({
    windowMs: config.security.rateLimit.windowMs,
    max: config.security.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const ip = Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : typeof req.headers['x-forwarded-for'] === 'string'
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.ip ?? 'unknown';
      return ip;
    },
    handler: (req: Request, res: Response) => {
      const mins = config.env === 'development' ? 2 * 60 : 60;
      res.setHeader('Retry-After', Math.ceil(mins));
      res.status(429).json({
        message: `Too many requests, please try again after: ${mins} minutes`,
      });
    },
  });

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
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(morgan('common'));
  app.use(limiter);
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const swaggerSpec = swaggerJsDoc(swaggerOptions);

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'JetManager API Docs',
    })
  );
  app.get('/swagger.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  app.use(`${config.apiPrefix}/auth`, authRoutes);
  app.use(`${config.apiPrefix}/organization`, organizationRoutes);
  app.use(`${config.apiPrefix}/project`, projectRoute);
  app.use(`${config.apiPrefix}/task`, taskRoute);
  app.use(`${config.apiPrefix}/comment`, commentRoute);
  app.use(`${config.apiPrefix}/subscription`, subscriptionRoute);

  app.use(ErrorHandler);

  const PORT = Number(config.port) || 8000;
  await prisma.$connect();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on Port ${PORT}`);
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

startServer();
