import { t } from 'elysia';

export const UserOutput = t.Object({
  id: t.String({
    format: 'uuid',
    description: 'Unique identifier for the user - UUIDv7',
  }),
  name: t.String({
    description: 'Display name of the user',
  }),
  email: t.String({
    format: 'email',
    description: 'Primary email address (unique)',
  }),
  createdAt: t.Date({ description: 'Timestamp when the resource was created' }),
  updatedAt: t.Date({
    description: 'Timestamp when the resource was last updated',
  }),
});
