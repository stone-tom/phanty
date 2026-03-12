import { initAuthServerClient } from '@repo/auth/server';
import { env } from '../env';
import { db } from './db';
import { mailer } from './mailer';

export const auth = initAuthServerClient({
  db,
  mailer,
  frontendURL: env.FRONTEND_URL,
  pepper: env.PASSWORD_PEPPER,
  fromEmail: `${env.SMTP_FROM_NAME} <${env.SMTP_FROM_EMAIL}>`,
});
