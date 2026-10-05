import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuditProvider } from './context/AuditContext';
import { I18nProvider } from './i18n/I18nContext';
import { ErrorBoundary, reloadForNewVersion } from './components/ErrorBoundary';
import './index.css';

// Vite fires this when a lazy chunk from an older deploy is gone; reload to get the new build.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewVersion()) event.preventDefault();
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const app = (
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ErrorBoundary>
          <AuditProvider>
            <App />
          </AuditProvider>
        </ErrorBoundary>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
);

// The build prerenders every page (see scripts/prerender.mjs) and marks which URL the HTML belongs to.
// Hydrate only when it matches; the 404 page or the dev server render from scratch.
const normalizedPath = window.location.pathname.replace(/(.)\/+$/, '$1');
if (rootElement.hasChildNodes() && document.documentElement.dataset.route === normalizedPath) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
