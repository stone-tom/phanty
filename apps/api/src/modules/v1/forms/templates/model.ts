import { t } from 'elysia';
import { MemberOutput } from '../../members/model';

export const FormTemplateStatusInput = t.Union([
  t.Literal('active'),
  t.Literal('archived'),
  t.Literal('all'),
]);

export const ListFormTemplatesQuery = t.Object({
  status: t.Optional(FormTemplateStatusInput),
});

export const HardDeleteFormTemplateQuery = t.Object({
  ifArchived: t.Optional(t.Boolean({ default: true })),
});

export const FormTemplateOutput = t.Object({
  id: t.String({
    format: 'uuid',
    description: 'Primary key - auto-generated UUIDv7',
  }),
  name: t.String({
    minLength: 1,
    description: 'Form template name',
  }),
  description: t.Union([t.String(), t.Null()]),
  archivedAt: t.Union([t.Date(), t.Null()]),
  createdBy: MemberOutput,
  createdAt: t.Date({ description: 'Timestamp when the resource was created' }),
  updatedAt: t.Date({
    description: 'Timestamp when the resource was last updated',
  }),
});

export const CreateFormTemplateInput = t.Object({
  name: t.String({
    minLength: 1,
    description: 'Form template name',
  }),
  description: t.Optional(t.Union([t.String(), t.Null()])),
});

export const UpdateFormTemplateInput = t.Object({
  name: t.Optional(
    t.String({
      minLength: 1,
      description: 'Form template name',
    }),
  ),
  description: t.Optional(t.Union([t.String(), t.Null()])),
});
