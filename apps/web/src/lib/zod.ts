import { i18n } from '@lingui/core';
import z from 'zod';
import type { AppLocale } from '../i18n';

type ZodLocaleModule = { localeError: z.core.$ZodErrorMap<z.core.$ZodIssue> };

export async function loadZodLocale(
	locale: AppLocale,
): Promise<ZodLocaleModule | null> {
	switch (locale) {
		case 'de': {
			const { default: de } = await import('zod/v4/locales/de.js');
			return de();
		}
		default: {
			const { default: en } = await import('zod/v4/locales/en.js');
			return en();
		}
	}
}

export function configureZod(zodLocale: ZodLocaleModule | null = null) {
	z.config({
		localeError: zodLocale?.localeError,
		customError: (iss) => {
			switch (iss.code) {
				case 'too_small':
					if (iss.minimum === 1) {
						return i18n._({
							id: 'validation.required',
							message: 'Field is required',
							comment: 'Validation error when field is empty',
						});
					}
			}

			return undefined; // fallback to default Zod message
		},
	});
}
