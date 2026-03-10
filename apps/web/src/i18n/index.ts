import { i18n, type Messages } from '@lingui/core';

export const locales = ['en', 'de'] as const;
export type AppLocale = (typeof locales)[number];

const localeLoaders: Record<AppLocale, () => Promise<{ messages: Messages }>> =
	{
		en: () => import('./locales/en/messages.ts'),
		de: () => import('./locales/de/messages.ts'),
	};

export async function loadLocale(locale: AppLocale) {
	const catalog = await localeLoaders[locale]();
	i18n.load(locale, catalog.messages);
	i18n.activate(locale);
}
