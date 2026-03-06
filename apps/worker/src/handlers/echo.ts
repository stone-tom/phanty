import { createLogger } from '@repo/logger';
import type { EchoJobData } from '@repo/queues';
import type { Job } from 'bullmq';

const logger = createLogger('worker', 'echoHandler');

export async function echoHandler(job: Job<EchoJobData>) {
  logger.info({ jobId: job.id, data: job.data }, 'Processing echo job');
  return { processed: true, timestamp: Date.now() };
}
