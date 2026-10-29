// Must stay first: moves saved data from the pre-rename keys before the stores read it.
import './migrate-boot';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Self-hosted fonts. All eight are available; the chosen one is applied through --font.
import '@fontsource-variable/inter';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/lora';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/manrope';
import '@fontsource-variable/nunito';
import '@fontsource-variable/fraunces';

import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/layout.css';
import '@/styles/common.css';
import '@/styles/sections.css';
import '@/styles/pages.css';
import '@/styles/category.css';
import '@/styles/settings.css';
import '@/styles/cart.css';
import '@/styles/herbal.css';
import '@/styles/demo.css';
import '@/styles/mobile.css';

import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotDemo } from './components/NotDemo';
import { DEMO_MODE } from './lib/demo';
import { applySavedTheme, loadSavedTemplate, loadThemeFont } from './templates/boot';

async function start() {
  // The saved template's catalogue loads before the first render, so nothing renders half-ready.
  // The template's catalogue and the theme font download side by side.
  if (DEMO_MODE) {
    const [template] = await Promise.all([loadSavedTemplate(), loadThemeFont()]);
    applySavedTheme(template);
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        {DEMO_MODE ? (
          <BrowserRouter>
            <App />
          </BrowserRouter>
        ) : (
          <NotDemo />
        )}
      </ErrorBoundary>
    </StrictMode>,
  );
}

void start();
