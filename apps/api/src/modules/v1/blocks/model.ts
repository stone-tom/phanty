import { t } from 'elysia';

export const BlockCategoryInput = t.Union([
  t.Literal('layout'),
  t.Literal('form'),
  t.Literal('content'),
  t.Literal('email'),
  t.Literal('pdf'),
]);

export const LayoutBlockTypeInput = t.Union([t.Literal('container')]);

export const FormBlockTypeInput = t.Union([t.Literal('text')]);

export const BlockDefinitionStatusInput = t.Union([
  t.Literal('active'),
  t.Literal('deprecated'),
  t.Literal('disabled'),
]);

export const ListBlocksQuery = t.Object({
  category: t.Optional(BlockCategoryInput),
});

const BaseBlockDefinitionOutput = {
  id: t.String({
    format: 'uuid',
    description: 'Primary key - auto-generated UUIDv7',
  }),
  name: t.String(),
  description: t.String(),
  version: t.Number(),
  status: BlockDefinitionStatusInput,
  createdAt: t.Date({ description: 'Timestamp when the resource was created' }),
  updatedAt: t.Date({
    description: 'Timestamp when the resource was last updated',
  }),
};

export const BlockDefinitionOutput = t.Union([
  t.Object({
    ...BaseBlockDefinitionOutput,
    category: t.Literal('layout'),
    type: LayoutBlockTypeInput,
  }),
  t.Object({
    ...BaseBlockDefinitionOutput,
    category: t.Literal('form'),
    type: FormBlockTypeInput,
  }),
]);
