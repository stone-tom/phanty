import { type Echo2JobData, QUEUES } from '@repo/queues';
import { type JobsOptions, Queue } from 'bullmq';
import { redisConnection } from '../lib/redis';

export const echo2Queue = new Queue<Echo2JobData>(QUEUES.ECHO2, {
  connection: redisConnection,
});

export function dispatchToEcho2Queue(
  data: Echo2JobData,
  queueOptions?: JobsOptions,
) {
  return echo2Queue.add('echo', data, queueOptions);
}
