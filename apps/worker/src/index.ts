import { createLogger } from '@repo/logger';
import type { Worker } from 'bullmq';
import { ERROR_CODE } from './types';
import { startWorkers, stopWorkers } from './worker';

const logger = createLogger('worker', 'main');

let workers: Worker[] = [];

async function main() {
  logger.info('Starting worker application');

  workers = await startWorkers();

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down...');
    await stopWorkers(workers);
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down...');
    await stopWorkers(workers);
    process.exit(0);
  });
}

main().catch((err) => {
  logger.error(
    {
      code: ERROR_CODE.COULD_NOT_START_WORKER,
      error: err,
    },
    'Failed to start worker',
  );
  process.exit(1);
});
