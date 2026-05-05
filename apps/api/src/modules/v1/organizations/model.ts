import { t } from 'elysia';

export const SetupOrganizationInput = t.Object({
  name: t.String({
    minLength: 1,
    description: 'Organization name',
  }),
  slug: t.String({
    minLength: 1,
    description: 'Organization slug',
  }),
});

const OrganizationMemberOutput = t.Object({
  id: t.String(),
  organizationId: t.String(),
  userId: t.String(),
  role: t.String(),
  createdAt: t.Date(),
});

export const SetupOrganizationOutput = t.Object({
  id: t.String(),
  name: t.String(),
  slug: t.String(),
  logo: t.Optional(t.Union([t.String(), t.Null()])),
  metadata: t.Optional(t.Any()),
  createdAt: t.Date(),
  members: t.Array(OrganizationMemberOutput),
});
