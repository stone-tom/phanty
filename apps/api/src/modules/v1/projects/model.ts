import { t } from 'elysia';
import { MemberOutput } from '../members/model';

export const ProjectOutput = t.Object({
  id: t.String({
    format: 'uuid',
    description: 'Primary key - auto-generated UUIDv7',
  }),
  name: t.String({
    minLength: 1,
    description: 'Project name',
  }),
  description: t.Union([t.String(), t.Null()]),
  createdBy: MemberOutput,
  createdAt: t.Date({ description: 'Timestamp when the resource was created' }),
  updatedAt: t.Date({
    description: 'Timestamp when the resource was last updated',
  }),
});
