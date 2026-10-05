import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: { env: Record<string, string | undefined> };

/**
 * Public URL of the deployed site, used for canonical/hreflang/Open Graph tags,
 * JSON-LD, robots.txt and sitemap.xml. Override with the SITE_URL env var in
 * the hosting provider (e.g. Vercel → Settings → Environment Variables).
 */
const SITE_URL = (process.env.SITE_URL ?? 'https://localaudit.dev').replace(/\/+$/, '');

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  define: { __SITE_URL__: JSON.stringify(SITE_URL) },
  resolve: {
    // The prerender (scripts/prerender.mjs) uses the web-streams server renderer, which runs fine on Node 18+.
    alias: isSsrBuild ? { 'react-dom/server': 'react-dom/server.browser' } : {},
  },
}));
