import { type EchoJobData, QUEUES } from '@repo/queues';
import { type JobsOptions, Queue } from 'bullmq';
import { redisConnection } from '../lib/redis';

export const echoQueue = new Queue<EchoJobData>(QUEUES.ECHO, {
  connection: redisConnection,
});

export function dispatchToEchoQueue(
  data: EchoJobData,
  queueOptions?: JobsOptions,
) {
  return echoQueue.add('echo', data, queueOptions);
}
