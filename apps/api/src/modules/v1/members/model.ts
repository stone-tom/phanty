import { t } from 'elysia';
import { UserOutput } from '../users/model';

export const MemberOutput = t.Object({
  id: t.String({
    format: 'uuid',
    description: 'Unique identifier for the membership record - UUIDv7',
  }),
  user: UserOutput,
  role: t.String({
    default: 'member',
    description:
      'Role of the member within the organization (e.g., member, admin, owner)',
  }),
  createdAt: t.Date({ description: 'Timestamp when the resource was created' }),
});
