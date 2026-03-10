import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { ThemeProvider } from './components/theme-provider.tsx';
import { Spinner } from './components/ui/spinner.tsx';
import { routeTree } from './routeTree.gen';
import { useLocaleStore } from './stores/locale.store.ts';

const router = createRouter({ routeTree });
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

function App() {
	const { initialize, isReady } = useLocaleStore();

	useEffect(() => {
		if (useLocaleStore.persist.hasHydrated()) {
			void initialize();
			return;
		}

		const unsubscribe = useLocaleStore.persist.onFinishHydration(() => {
			void initialize();
		});

		return unsubscribe;
	}, [initialize]);

	if (!isReady) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}

	return (
		<I18nProvider i18n={i18n}>
			<RouterProvider router={router} />
		</I18nProvider>
	);
}

// biome-ignore lint:style/noNonNullAssertion
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);

	root.render(
		<StrictMode>
			<ThemeProvider>
				<App />
			</ThemeProvider>
		</StrictMode>,
	);
}
