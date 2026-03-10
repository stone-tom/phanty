import { Languages, Moon, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { type AppLocale, locales } from '@/i18n';
import { cn } from '@/lib/utils';
import { useLocaleStore } from '@/stores/locale.store';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function prefersDarkMode() {
	if (typeof window === 'undefined' || !window.matchMedia) {
		return false;
	}

	return window.matchMedia(COLOR_SCHEME_QUERY).matches;
}

export function PreferencesSwitcher() {
	const { theme, setTheme } = useTheme();
	const locale = useLocaleStore((state) => state.locale);
	const setLocale = useLocaleStore((state) => state.setLocale);
	const [isSwitchingLocale, setIsSwitchingLocale] = useState(false);

	const resolvedTheme = useMemo(() => {
		if (theme === 'system') {
			return prefersDarkMode() ? 'dark' : 'light';
		}

		return theme;
	}, [theme]);

	const handleLocaleChange = async (nextLocale: AppLocale) => {
		if (nextLocale === locale || isSwitchingLocale) {
			return;
		}

		setIsSwitchingLocale(true);
		try {
			await setLocale(nextLocale);
		} finally {
			setIsSwitchingLocale(false);
		}
	};

	return (
		<div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border p-1  backdrop-blur supports-backdrop-filter:bg-background/80">
			<div className="flex items-center rounded-md border bg-muted/40 p-0.5">
				<Button
					type="button"
					size="icon-sm"
					variant={resolvedTheme === 'light' ? 'default' : 'ghost'}
					aria-label="Use light theme"
					onClick={() => {
						setTheme('light');
					}}
				>
					<Sun />
				</Button>
				<Button
					type="button"
					size="icon-sm"
					variant={resolvedTheme === 'dark' ? 'default' : 'ghost'}
					aria-label="Use dark theme"
					onClick={() => {
						setTheme('dark');
					}}
				>
					<Moon />
				</Button>
			</div>

			<div className="flex items-center rounded-md border bg-muted/40 p-0.5">
				<div className="text-muted-foreground px-2">
					<Languages className="size-3.5" />
				</div>
				{locales.map((supportedLocale) => (
					<Button
						key={supportedLocale}
						type="button"
						size="sm"
						variant={locale === supportedLocale ? 'default' : 'ghost'}
						disabled={isSwitchingLocale}
						aria-label={`Switch language to ${supportedLocale.toUpperCase()}`}
						onClick={() => {
							handleLocaleChange(supportedLocale);
						}}
						className={cn(
							'min-w-11 uppercase',
							isSwitchingLocale && 'opacity-70',
						)}
					>
						{supportedLocale}
					</Button>
				))}
			</div>
		</div>
	);
}
