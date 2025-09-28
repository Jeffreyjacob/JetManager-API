import Redis from 'ioredis';
import { getConfig } from './config';

const config = getConfig();
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxLoadingTimeout: 1000,
  lazyConnect: true,
};
