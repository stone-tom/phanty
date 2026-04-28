import type { BlockEditorDocument } from '@repo/templates';
import { t } from 'elysia';
import { MemberOutput } from '../members/model';

export const TemplateTypeInput = t.Union([
  t.Literal('form'),
  t.Literal('pdf'),
  t.Literal('email'),
  t.Literal('content'),
]);

export const TemplateStatusInput = t.Union([
  t.Literal('active'),
  t.Literal('archived'),
  t.Literal('all'),
]);

export const ListTemplatesQuery = t.Object({
  type: t.Optional(TemplateTypeInput),
  status: t.Optional(TemplateStatusInput),
});

export const HardDeleteTemplateQuery = t.Object({
  ifArchived: t.Optional(t.Boolean({ default: true })),
});

export const TemplateDocumentOutput = t.Any() as ReturnType<
  typeof t.Unsafe<BlockEditorDocument>
>;

export const TemplateOutput = t.Object({
  id: t.String({
    format: 'uuid',
    description: 'Primary key - auto-generated UUIDv7',
  }),
  type: TemplateTypeInput,
  name: t.String({
    minLength: 1,
    description: 'Template name',
  }),
  description: t.Union([t.String(), t.Null()]),
  document: TemplateDocumentOutput,
  archivedAt: t.Union([t.Date(), t.Null()]),
  createdBy: MemberOutput,
  createdAt: t.Date({ description: 'Timestamp when the resource was created' }),
  updatedAt: t.Date({
    description: 'Timestamp when the resource was last updated',
  }),
});

export const CreateTemplateInput = t.Object({
  type: t.Literal('form'),
  name: t.String({
    minLength: 1,
    description: 'Template name',
  }),
  description: t.Optional(t.Union([t.String(), t.Null()])),
});

export const UpdateTemplateInput = t.Object({
  name: t.Optional(
    t.String({
      minLength: 1,
      description: 'Template name',
    }),
  ),
  description: t.Optional(t.Union([t.String(), t.Null()])),
});

export const UpdateTemplateDocumentInput = t.Object({
  document: TemplateDocumentOutput,
});
