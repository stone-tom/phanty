import type { Database } from '@repo/db/client';
import type { Mailer } from '@repo/emails';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';
import { randomUUIDv7 } from 'bun';

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
    plugins: [organization()],
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
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
