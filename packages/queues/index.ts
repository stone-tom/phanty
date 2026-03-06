export const QUEUES = {
  ECHO: '{echo}',
  ECHO2: '{echo2}',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

export interface EchoJobData {
  message: string;
  timestamp?: number;
}

export interface Echo2JobData {
  timestamp?: number;
}

export type QueueJobData = {
  [QUEUES.ECHO]: EchoJobData;
  [QUEUES.ECHO2]: Echo2JobData;
};

export type QueueNamesList = QueueName[];

export const ALL_QUEUES: QueueName[] = Object.values(QUEUES) as QueueName[];
