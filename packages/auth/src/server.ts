import type { Database } from '@repo/db/client';
import { member } from '@repo/db/schema';
import type { Mailer } from '@repo/emails';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink, openAPI, organization } from 'better-auth/plugins';
import { randomUUIDv7 } from 'bun';
import { and, asc, eq } from 'drizzle-orm';

interface InitAuthClientParams {
  frontendURL: string;
  pepper: string;
  db: Database;
  mailer: Mailer;
  fromEmail: string;
}

export const initAuthServerClient = ({
  frontendURL,
  pepper,
  db,
  mailer,
  fromEmail,
}: InitAuthClientParams) =>
  betterAuth({
    plugins: [
      organization(),
      magicLink({
        disableSignUp: false,
        sendMagicLink: async ({ email, url, token }) => {
          await mailer.sendMail({
            to: [email],
            from: fromEmail,
            subject: 'Log in to phanty',
            type: 'magic-link-login',
            params: {
              email,
              url,
              token,
            },
          });
        },
      }),
      openAPI(),
    ],
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const firstOwnerMembership = await db.query.member.findFirst({
              where: and(
                eq(member.userId, session.userId),
                eq(member.role, 'owner'),
              ),
              orderBy: asc(member.createdAt),
            });

            return {
              data: {
                ...session,
                activeOrganizationId: firstOwnerMembership?.organizationId,
              },
            };
          },
        },
      },
    },
    trustedOrigins: [frontendURL],
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        await mailer.sendMail({
          to: [user.email],
          from: fromEmail,
          subject: 'Reset your password',
          type: 'forgot-password',
          params: {
            name: user.name,
            resetPasswordLink: url,
          },
        });
      },
      password: {
        hash: async (password: string) => {
          // OWASP minimum -> TODO revisit later maybe
          return Bun.password.hash(`${password}${pepper}`, {
            algorithm: 'argon2id',
            memoryCost: 19456, // 19 MiB (19 * 1024 KiB) - OWASP minimum
            timeCost: 2, // OWASP minimum iterations
          });
        },
        verify: async ({ hash, password }) => {
          return Bun.password.verify(`${password}${pepper}`, hash);
        },
      },
    },
    advanced: {
      database: {
        generateId: () => randomUUIDv7(),
      },
    },
  });
