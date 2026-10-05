import { StrictMode } from 'react';
// Aliased to react-dom/server.browser for the SSR build (vite.config.ts): web streams, no Node typings needed.
import { renderToReadableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './App';
import { AuditProvider } from './context/AuditContext';
import { I18nProvider, messagesFor } from './i18n/I18nContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getPageSeo, renderHeadHtml, SITE_URL } from './seo/seo';
import { LANGUAGES, NOINDEX_PATHS, PAGE_PATHS, localizePath, splitLocalePath } from './i18n/paths';

export { LANGUAGES, NOINDEX_PATHS, PAGE_PATHS, SITE_URL, localizePath };

/** Renders one URL to HTML, waiting for lazy pages so the output contains the full content. */
async function renderApp(url: string): Promise<string> {
  const stream = await renderToReadableStream(
    <StrictMode>
      <StaticRouter location={url}>
        <I18nProvider>
          <ErrorBoundary>
            <AuditProvider>
              <App />
            </AuditProvider>
          </ErrorBoundary>
        </I18nProvider>
      </StaticRouter>
    </StrictMode>,
    {
      onError: (error) => {
        throw error;
      },
    },
  );
  await stream.allReady;
  return new Response(stream).text();
}

export interface RenderedPage {
  appHtml: string;
  headHtml: string;
  htmlLang: string;
}

export async function renderPage(url: string): Promise<RenderedPage> {
  const { lang, path } = splitLocalePath(url);
  const messages = messagesFor(lang);
  return {
    appHtml: await renderApp(url),
    headHtml: renderHeadHtml(getPageSeo(path, lang, messages)),
    htmlLang: messages.meta.htmlLang,
  };
}
