export interface AppConfig {
  env: string;
  port: number | string;
  apiPrefix: string;
  frontendUrls: {
    baseUrl: string;
    verifiyEmail: string;
    passwordReset: string;
  };
  tokens: {
    accessToken: {
      tokenKey: string;
      tokenExpiresIn: string;
    };
    refreshToken: {
      tokenKey: string;
      tokenExpiresIn: string;
    };
  };
  email: {
    from: string;
    host: string;
    service: string;
    port: number;
    auth: {
      user: string;
      password: string;
    };
  };
  security: {
    cors: {
      origin: string;
      credentials: boolean;
    };
    rateLimit: {
      windowMs: number;
      max: number;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  bullmq: {
    defaultJobOptions: {
      removeOnComplete: number;
      removeOnFail: number;
      attempts: number;
      backoff: {
        type: string;
        delay: number;
      };
    };
    concurrency: number;
  };
  stripe: {
    stripe_secret_key: string;
    stripe_webhook_secret: string;
  };
}

export const getConfig = (): AppConfig => ({
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  frontendUrls: {
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    verifiyEmail: `${process.env.FRONTEND_URL}/verifyEmail`,
    passwordReset: `${process.env.FRONTEND_URL}/resetPassword`,
  },
  tokens: {
    accessToken: {
      tokenKey: process.env.ACCESS_TOKEN_KEY!,
      tokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRESIN!,
    },
    refreshToken: {
      tokenKey: process.env.REFRESH_TOKEN_KEY!,
      tokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRESIN!,
    },
  },
  email: {
    from: process.env.EMAIL_MAIL!,
    host: process.env.EMAIL_HOST!,
    service: process.env.EMAIL_SERVICES!,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    auth: {
      user: process.env.EMAIL_MAIL!,
      password: process.env.EMAIL_PASSWORD!,
    },
  },
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.NODEENV === 'development' ? '1000' : '100', 10),
    },
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  bullmq: {
    defaultJobOptions: {
      removeOnComplete: parseInt(
        process.env.BULLMQ_REMOVE_ON_COMPLETE || '100',
        10
      ),
      removeOnFail: parseInt(process.env.BULLMQ_ON_FAIL || '50', 10),
      attempts: parseInt(process.env.BULL_MQ_ATTEMPTS || '3', 10),
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env.BULLMQ_BACKOFF_DELAY || '2000', 10),
      },
    },
    concurrency: parseInt(process.env.BULLMQ_CONCURRENCY || '10', 10),
  },
  stripe: {
    stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
});
