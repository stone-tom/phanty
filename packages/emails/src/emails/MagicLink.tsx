import { Button, CodeInline, Section, Text } from '@react-email/components';
import { render, toPlainText } from '@react-email/render';
import { BaseLayout } from '../components/BaseLayout';

export interface MagicLinkEmailProps {
  email: string;
  token: string;
  url: string;
}

export default function MagicLinkEmail({
  email = 'ele@phanty.app',
  token = '123456',
  url = 'https',
}: MagicLinkEmailProps) {
  return (
    <BaseLayout previewText="Reset your password">
      <Section>
        <Text className="text-[#333] text-xl font-bold p-0 my-7.5">
          Your login code for phanty
        </Text>
        <Text className="text-[#333] text-sm leading-6"></Text>
        <Section className="text-center my-8">
          <Button
            className="bg-black rounded-[5px] text-white text-sm font-bold no-underline text-center block p-3 w-fit"
            href={url}
          >
            Log in to phanty
          </Button>
        </Section>
        <Text className="text-[#333] text-sm leading-6">
          Your login code for Linear Login to Linear This link and code will
          only be valid for the next 5 minutes. If the link does not work, you
          can use the login verification code directly:
        </Text>
        <CodeInline className="bg-gray-200 p-1.5 rounded text-2xl">
          {token}
        </CodeInline>
        <Text className="text-sm leading-6 italic text-gray-400">
          If you did not request a login code for {email}, you can safely ignore
          this email.
        </Text>
      </Section>
    </BaseLayout>
  );
}

export const magicLinkRenderer = {
  html: (params: MagicLinkEmailProps) => render(<MagicLinkEmail {...params} />),
  plainText: async (params: MagicLinkEmailProps) =>
    toPlainText(await magicLinkRenderer.html(params)),
};
