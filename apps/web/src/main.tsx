import { createRouter, RouterProvider } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.css';
import { ThemeProvider } from './components/theme-provider';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <NuqsAdapter>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </NuqsAdapter>
    </StrictMode>,
  );
}
