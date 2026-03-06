import { createLogger } from '@repo/logger';
import type { Echo2JobData } from '@repo/queues';
import type { Job } from 'bullmq';

const logger = createLogger('worker', 'echo2Handler');

export async function echo2Handler(job: Job<Echo2JobData>) {
  logger.info({ jobId: job.id, data: job.data }, 'Processing echo2 job');
  return { processed: true, timestamp: Date.now() };
}
