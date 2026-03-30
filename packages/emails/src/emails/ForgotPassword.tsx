import { Button, Section, Text } from '@react-email/components';
import { render, toPlainText } from '@react-email/render';
import { BaseLayout } from '../components/BaseLayout';

export interface ForgotPasswordEmailProps {
  name?: string;
  resetPasswordLink?: string;
}

export default function ForgotPasswordEmail({
  name = 'there',
  resetPasswordLink = 'https://example.com/reset-password',
}: ForgotPasswordEmailProps) {
  return (
    <BaseLayout previewText="Reset your password">
      <Section>
        <Text className="text-[#333] text-xl font-bold uppercase p-0 my-7.5">
          Hi {name},
        </Text>
        <Text className="text-[#333] text-sm leading-6">
          Someone requested a password reset for your account. If this was you,
          you can set a new password here:
        </Text>
        <Section className="text-center my-8">
          <Button
            className="bg-black rounded-[5px] text-white text-sm font-bold no-underline text-center block w-full p-3"
            href={resetPasswordLink}
          >
            Reset password
          </Button>
        </Section>
        <Text className="text-[#333] text-sm leading-6">
          If you don't want to change your password or didn't request this, just
          ignore and delete this message.
        </Text>
        <Text className="text-[#333] text-sm leading-6">
          To keep your account secure, please don't forward this email to
          anyone.
        </Text>
        <Text className="text-[#333] text-sm leading-6">Happy coding!</Text>
      </Section>
    </BaseLayout>
  );
}

export const forgotPasswordRenderer = {
  html: (params: ForgotPasswordEmailProps) =>
    render(<ForgotPasswordEmail {...params} />),
  plainText: async (params: ForgotPasswordEmailProps) =>
    toPlainText(await forgotPasswordRenderer.html(params)),
};
