import Elysia, { t } from 'elysia';
import { betterAuth } from '../../../plugins/better-auth';
import { ErrorOutput } from '../../../plugins/error-handler';
import { BlockDefinitionOutput, ListBlocksQuery } from './model';
import { blockService } from './service';

export const blocks = new Elysia({ prefix: '/blocks' })
  .use(betterAuth)
  .use(blockService)
  .get(
    '/',
    ({ blockService, organization, query }) => {
      return blockService.findAvailableBlocks(organization.id, query.category);
    },
    {
      auth: true,
      response: {
        200: t.Array(BlockDefinitionOutput),
        401: ErrorOutput,
        422: ErrorOutput,
      },
      query: ListBlocksQuery,
    },
  );
