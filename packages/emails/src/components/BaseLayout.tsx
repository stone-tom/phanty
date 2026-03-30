import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

interface BaseLayoutProps {
  children: ReactNode;
  previewText: string;
}

export const BaseLayout = ({ children, previewText }: BaseLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f6f9fc] font-sans">
          <Container className="bg-white mx-auto pt-5 pb-12 mb-16">
            <Section className="p-8 text-center">
              <Text className="text-2xl font-bold text-black tracking-widest m-0">
                phanty
              </Text>
            </Section>
            <Section className="px-8">{children}</Section>
            <Hr className="border-[#e6ebf1] my-5" />
            <Section className="px-8 text-center">
              <Text className="text-[#8898aa] text-xs leading-4">
                &copy; {new Date().getFullYear()} phanty. All rights reserved.
              </Text>
              <Text className="text-[#8898aa] text-xs leading-4">
                If you have any questions, feel free to contact our support
                team.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
