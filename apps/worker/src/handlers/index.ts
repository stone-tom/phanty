import { QUEUES } from '@repo/queues';
import { echoHandler } from './echo';
import { echo2Handler } from './echo2';

export default {
  [QUEUES.ECHO]: echoHandler,
  [QUEUES.ECHO2]: echo2Handler,
};
