import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Could not find root node!');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
