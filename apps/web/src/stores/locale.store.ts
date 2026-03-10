import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AppLocale, loadLocale } from '@/i18n';
import { configureZod, loadZodLocale } from '@/lib/zod';

type LocaleState = {
	locale: AppLocale;
	isReady: boolean;
	setLocale: (locale: AppLocale) => Promise<void>;
	initialize: () => Promise<void>;
};

export const useLocaleStore = create<LocaleState>()(
	persist(
		(set, get) => ({
			locale: 'en',
			isReady: false,

			setLocale: async (next) => {
				await loadLocale(next);
				const zodLocale = await loadZodLocale(next);
				configureZod(zodLocale);
				set({ locale: next, isReady: true });
			},

			initialize: async () => {
				const state = get();
				if (state.isReady) return;

				await loadLocale(state.locale);
				const zodLocale = await loadZodLocale(state.locale);
				configureZod(zodLocale);
				set({ isReady: true });
			},
		}),
		{
			name: 'app-locale',
			partialize: (state) => ({ locale: state.locale }),
		},
	),
);
