import { createMailer } from '@repo/emails';
import { env } from '../env';

export const mailer = createMailer({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  ...(env.SMTP_PASS && env.SMTP_USER
    ? {
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      }
    : {}),
});
