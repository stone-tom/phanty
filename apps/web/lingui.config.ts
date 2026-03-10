import { defineConfig } from '@lingui/cli';

export default defineConfig({
	sourceLocale: 'en',
	locales: ['en', 'de'],
	catalogs: [
		{
			path: '<rootDir>/src/i18n/locales/{locale}/messages',
			include: ['src'],
		},
	],
});
