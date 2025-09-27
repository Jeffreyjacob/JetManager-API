export interface AppConfig {
  env: string;
  port: number | string;
  apiPrefix: string;
  frontendUrls: {
    baseUrl: string;
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
}

export const getConfig = (): AppConfig => ({
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8000,
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  frontendUrls: {
    baseUrl: process.env.FRONTEND_URL || "http://localhost:3000",
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
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    auth: {
      user: process.env.EMAIL_MAIL!,
      password: process.env.EMAIL_PASSWORD!,
    },
  },
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: process.env.CORS_CREDENTIALS === "true",
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
      max: parseInt(process.env.NODEENV === "development" ? "1000" : "100", 10),
    },
  },
});
