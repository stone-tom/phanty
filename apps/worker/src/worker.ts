import { createLogger } from '@repo/logger';
import { ALL_QUEUES, type QueueName } from '@repo/queues';
import { type ConnectionOptions, Worker } from 'bullmq';
import { env } from './env';
import handlers from './handlers';
import { ERROR_CODE } from './types';

const logger = createLogger('worker', 'manager');

const CONNECTION_OPTIONS: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  username: env.REDIS_USERNAME,
};

export interface QueueConfig {
  name: QueueName;
  concurrency: number;
}

export function getQueueConfig(): QueueConfig[] {
  const { WORKER_QUEUES, WORKER_DEFAULT_CONCURRENCY } = env;

  if (WORKER_QUEUES === 'all') {
    return ALL_QUEUES.map((name) => ({
      name,
      concurrency: WORKER_DEFAULT_CONCURRENCY,
    }));
  }

  const configs: QueueConfig[] = [];
  const parts = WORKER_QUEUES.split(',');

  for (const part of parts) {
    const [name, concurrencyStr] = part.split(':');
    if (!name || !concurrencyStr) {
      logger.error(
        {
          code: ERROR_CODE.INIT_QUEUE_CONFIG,
          queueConfig: WORKER_QUEUES,
          failedPart: part,
        },
        `Invalid format for queue configuration.`,
      );
      process.exit(1);
    }
    const queueName = name.trim() as QueueName;

    if (!ALL_QUEUES.includes(queueName)) {
      logger.error(
        {
          code: ERROR_CODE.INIT_QUEUE_CONFIG,
          queueConfig: WORKER_QUEUES,
          failedPart: part,
        },
        `Invalid queue name: ${queueName}`,
      );
      process.exit(1);
    }

    const concurrency = concurrencyStr
      ? parseInt(concurrencyStr.trim(), 10)
      : WORKER_DEFAULT_CONCURRENCY;

    configs.push({ name: queueName, concurrency });
  }

  return configs;
}

export function createWorker(
  queueName: QueueName,
  concurrency: number,
): Worker {
  const handler = handlers[queueName];
  if (!handler) {
    logger.error(
      {
        code: ERROR_CODE.INIT_QUEUE_CONFIG,
        queueName,
      },
      `Invalid queue name: ${queueName}. Could not get handler function`,
    );
    process.exit(1);
  }

  const worker = new Worker(queueName, handler, {
    connection: CONNECTION_OPTIONS,
    concurrency,
    autorun: false,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 5000 },
  });

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, queue: queueName }, 'Job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error(
      {
        code: ERROR_CODE.JOB_FAILED,
        jobId: job?.id,
        queue: queueName,
        error: err.message,
        stack:
          env.NODE_ENV === 'development' && err.stack ? err.stack : undefined,
      },
      'Job failed',
    );
  });

  logger.info(
    { queue: queueName, concurrency },
    `Worker "${queueName}" started`,
  );

  return worker;
}

export async function startWorkers(): Promise<Worker[]> {
  const configs = getQueueConfig();
  const workers: Worker[] = [];

  for (const config of configs) {
    const worker = createWorker(config.name, config.concurrency);
    workers.push(worker);
  }

  await Promise.all(workers.map((worker) => worker.run()));

  logger.info(
    { queues: configs.map((c) => `${c.name}:${c.concurrency}`) },
    'All workers started',
  );

  return workers;
}

export async function stopWorkers(workers: Worker[]): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  logger.info('All workers stopped');
}
