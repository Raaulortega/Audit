// Build step: turns the client build into one static HTML file per page and language,
// so crawlers and link previews get the full content and <head> without running JavaScript.
// Runs after `vite build` (client) and `vite build --ssr src/entry-server.tsx` (renderer).
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const ssrDir = fileURLToPath(new URL('../dist-ssr/', import.meta.url));
const { renderPage, PAGE_PATHS, LANGUAGES, NOINDEX_PATHS, SITE_URL, localizePath } = await import(
  new URL('../dist-ssr/entry-server.js', import.meta.url).href
);

const template = await readFile(`${dist}index.html`, 'utf8');
if (!template.includes('<!--seo-head-->') || !template.includes('<div id="root"></div>')) {
  throw new Error('index.html is missing the <!--seo-head--> or <div id="root"></div> placeholder');
}

/** `route` is written to <html data-route> so the client only hydrates HTML made for its URL. */
function toDocument(page, route) {
  return template
    .replace('<html lang="en">', `<html lang="${page.htmlLang}" data-route="${route}">`)
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace('<!--seo-head-->', page.headHtml)
    .replace('<div id="root"></div>', `<div id="root">${page.appHtml}</div>`);
}

/** "/" → index.html, "/scanner" → scanner.html, "/es/jwt" → es/jwt.html (served without .html via cleanUrls). */
function fileFor(route) {
  return route === '/' ? 'index.html' : `${route.slice(1)}.html`;
}

async function write(file, content) {
  await mkdir(dirname(`${dist}${file}`), { recursive: true });
  await writeFile(`${dist}${file}`, content);
}

let pages = 0;
for (const lang of LANGUAGES) {
  for (const path of PAGE_PATHS) {
    const route = localizePath(path, lang);
    await write(fileFor(route), toDocument(await renderPage(route), route));
    pages += 1;
  }
}

// Served by Vercel with status 404 for unknown URLs; the client re-renders it in the right language.
await write('404.html', toDocument(await renderPage('/404'), '/404'));

const today = new Date().toISOString().slice(0, 10);
const indexable = PAGE_PATHS.filter((path) => !NOINDEX_PATHS.has(path));
const urls = indexable.flatMap((path) =>
  LANGUAGES.map((lang) => {
    const alternates = [...LANGUAGES, 'x-default']
      .map((alt) => {
        const href = `${SITE_URL}${localizePath(path, alt === 'x-default' ? 'en' : alt)}`;
        return `    <xhtml:link rel="alternate" hreflang="${alt}" href="${href}" />`;
      })
      .join('\n');
    return [
      '  <url>',
      `    <loc>${SITE_URL}${localizePath(path, lang)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <priority>${path === '/' ? '1.0' : '0.8'}</priority>`,
      alternates,
      '  </url>',
    ].join('\n');
  }),
);
await write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
);
await write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

await rm(ssrDir, { recursive: true, force: true });
console.log(`prerendered ${pages} pages + 404.html, sitemap.xml (${urls.length} URLs) for ${SITE_URL}`);
