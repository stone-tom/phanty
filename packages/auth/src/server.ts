import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { randomUUIDv7 } from 'bun';
import { db } from './lib/db';
import { env } from './env';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  trustedOrigins: [
    env.FRONTEND_URL,
  ],
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        // OWASP minimum -> TODO revisit later maybe
        return Bun.password.hash(`${password}${env.PASSWORD_PEPPER}`, {
          algorithm: "argon2id",
          memoryCost: 19456,  // 19 MiB (19 * 1024 KiB) - OWASP minimum
          timeCost: 2,        // OWASP minimum iterations
        });
      },
      verify: async ({ hash, password }) => {
        return Bun.password.verify(`${password}${env.PASSWORD_PEPPER}`, hash);
      }
    }
  },
  advanced: {
    database: {
      generateId: () => randomUUIDv7(),
    },
  },
});
