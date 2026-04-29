import Elysia from 'elysia';
import { auth } from '../../../lib/auth';
import { ErrorOutput } from '../../../plugins/error-handler';
import { SetupOrganizationInput, SetupOrganizationOutput } from './model';

export const organizations = new Elysia({ prefix: '/organizations' }).post(
  '/setup',
  async ({ body, request, set }) => {
    const { headers } = request;
    const session = await auth.api.getSession({ headers });

    if (!session) {
      set.status = 401;
      throw new Error('Not authorized.');
    }

    try {
      const organization = await auth.api.createOrganization({
        headers,
        body,
      });

      // TODO: Grant default block access once organization block access exists.
      const members = organization.members.filter(
        (
          member,
        ): member is NonNullable<(typeof organization.members)[number]> =>
          member !== undefined,
      );

      return {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo ?? null,
        metadata: organization.metadata,
        createdAt: organization.createdAt,
        members,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        'statusCode' in error &&
        typeof error.statusCode === 'number'
      ) {
        set.status = [401, 403, 422].includes(error.statusCode)
          ? error.statusCode
          : 400;
      }

      throw error;
    }
  },
  {
    body: SetupOrganizationInput,
    response: {
      200: SetupOrganizationOutput,
      400: ErrorOutput,
      401: ErrorOutput,
      403: ErrorOutput,
      422: ErrorOutput,
    },
  },
);
