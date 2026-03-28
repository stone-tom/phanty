import { member, organization } from '@repo/db/schema';
import { and, eq } from 'drizzle-orm';
import Elysia from 'elysia';
import { auth } from '../lib/auth';
import { db } from '../lib/db';

// TODO optimize: I dont like these much queries tbh return status kinda wierd lets maybe figure something out
export const betterAuth = new Elysia({ name: 'better-auth' }).macro({
  auth: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session?.session.activeOrganizationId) {
        return status(401, {
          status: 401,
          code: 'NOT_AUTHORIZED',
          message: 'Not authorized.',
        });
      }

      const activeOrganization = await db.query.organization.findFirst({
        where: eq(organization.id, session.session.activeOrganizationId),
      });

      if (!activeOrganization) {
        return status(401, {
          status: 401,
          code: 'NOT_AUTHORIZED',
          message: 'Not authorized.',
        });
      }

      const activeMember = await db.query.member.findFirst({
        where: and(
          eq(member.organizationId, activeOrganization.id),
          eq(member.userId, session.user.id),
        ),
      });

      if (!activeMember) {
        return status(401, {
          status: 401,
          code: 'NOT_AUTHORIZED',
          message: 'Not authorized.',
        });
      }

      return {
        user: session.user,
        session: session.session,
        organization: activeOrganization,
        member: activeMember,
      };
    },
  },
});
