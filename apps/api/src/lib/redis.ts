import type { RedisOptions } from 'bullmq';
import { RedisClient } from 'bun';
import { env } from '../env';

export const redisConnection: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  username: env.REDIS_USERNAME,
  maxRetriesPerRequest: null,
};

function buildRedisUrl(conn: RedisOptions): string {
  const host = conn.host ?? 'localhost';
  const port = conn.port ?? 6379;
  const username = conn.username ?? '';
  const password = conn.password ?? '';

  if (password) {
    return `redis://${username}:${password}@${host}:${port}`;
  }
  return `redis://${host}:${port}`;
}

export const redisClient = new RedisClient(buildRedisUrl(redisConnection));
