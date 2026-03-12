import { createLogger } from '@repo/logger';
import { type Attachment, createMessage } from '@upyo/core';
import { type SmtpConfig, SmtpTransport } from '@upyo/smtp';
import {
  type ForgotPasswordEmailProps,
  forgotPasswordRenderer,
} from './emails/ForgotPassword';

export interface BaseMailingData {
  from: string;
  to: string[];
  subject: string;
  headers?: Record<string, string>;
  attachments?: (Attachment | File)[];
  replyTo?: string[];
  cc?: string[];
  bcc?: string[];
}

export interface ForgotPasswordMail extends BaseMailingData {
  type: 'forgot-password';
  params: ForgotPasswordEmailProps;
}

type MailParamsMap = {
  'forgot-password': ForgotPasswordEmailProps;
};

type MailData<K extends keyof MailParamsMap = keyof MailParamsMap> = {
  [T in K]: BaseMailingData & { type: T; params: MailParamsMap[T] };
}[K];

const templates: {
  [K in keyof MailParamsMap]: {
    html: (params: MailParamsMap[K]) => Promise<string>;
    plainText: (params: MailParamsMap[K]) => Promise<string>;
  };
} = {
  'forgot-password': forgotPasswordRenderer,
};

enum MAIL_ERROR_CODES {
  RENDERER_NOT_FOUND = 'RENDERER_NOT_FOUND',
  FAILED_TO_SEND_MAIL = 'FAILED_TO_SEND_MAIL',
}

export class Mailer {
  private readonly transport: SmtpTransport;

  private readonly logger = createLogger('mailer', 'main');

  constructor(config: SmtpConfig) {
    this.transport = new SmtpTransport(config);
  }

  async sendMail<K extends keyof MailParamsMap>(
    mail: MailData<K>,
  ): Promise<void> {
    const renderer = templates[mail.type];
    if (!renderer) {
      this.logger.error(
        {
          type: mail.type,
          code: MAIL_ERROR_CODES.RENDERER_NOT_FOUND,
        },
        `Could not find mail renderer for type ${mail.type}`,
      );
      throw new Error(`Could not find mail renderer for type ${mail.type}`);
    }
    const [htmlContent, textContent] = await Promise.all([
      renderer.html(mail.params),
      renderer.plainText(mail.params),
    ]);

    const message = createMessage({
      ...mail,
      content: {
        html: htmlContent,
        text: textContent,
      },
    });

    const receipt = await this.transport.send(message);
    if (!receipt.successful) {
      this.logger.error(
        {
          type: mail.type,
          errorMessages: receipt.errorMessages,
          code: MAIL_ERROR_CODES.FAILED_TO_SEND_MAIL,
        },
        'Failed to send mail',
      );
      throw new Error('Failed to send mail');
    } else {
      this.logger.debug(
        {
          messageId: receipt.messageId,
          type: mail.type,
        },
        `Successfully sent mail ${mail.type} ${receipt.messageId}`,
      );
    }
  }

  close() {
    return this.transport.closeAllConnections();
  }
}

export const createMailer = (config: SmtpConfig) => new Mailer(config);
