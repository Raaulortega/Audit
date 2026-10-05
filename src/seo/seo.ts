import type { Messages } from '../i18n/en';
import { LANGUAGES, NOINDEX_PATHS, isPagePath, localizePath, type Language } from '../i18n/paths';

export const SITE_NAME = 'LocalAudit';
export const SITE_URL: string = typeof __SITE_URL__ === 'string' ? __SITE_URL__ : 'https://localaudit.dev';

export interface PageSeo {
  lang: Language;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogLocale: string;
  ogImage: string;
  alternates: Array<{ hreflang: string; href: string }>;
  jsonLd: object[];
}

const absolute = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`;

/**
 * Everything a search engine or social preview needs for one page, shared by
 * the build-time prerender (static <head>) and the client (route changes).
 */
export function getPageSeo(path: string, lang: Language, messages: Messages): PageSeo {
  const known = isPagePath(path);
  const page = known ? messages.seo.pages[path] : messages.seo.notFound;
  const indexable = known && !NOINDEX_PATHS.has(path);
  const canonical = absolute(localizePath(known ? path : '/', lang));

  const alternates = known
    ? [
        ...LANGUAGES.map((alt) => ({ hreflang: alt, href: absolute(localizePath(path, alt)) })),
        { hreflang: 'x-default', href: absolute(localizePath(path, 'en')) },
      ]
    : [];

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absolute(localizePath('/', lang)),
    inLanguage: messages.meta.htmlLang,
    description: messages.seo.appDescription,
  };
  const application = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: path === '/' ? SITE_NAME : page.title.replace(/ \| LocalAudit$/, ''),
    url: canonical,
    description: page.description,
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Any (runs in the web browser)',
    browserRequirements: 'Requires JavaScript',
    inLanguage: messages.meta.htmlLang,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    image: `${SITE_URL}/og-image-${lang}.png`,
    ...(path === '/' ? { featureList: messages.seo.features } : {}),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: messages.seo.breadcrumbHome, item: absolute(localizePath('/', lang)) },
      ...(path !== '/' && known
        ? [{ '@type': 'ListItem', position: 2, name: messages.nav.items[path]?.label ?? page.title, item: canonical }]
        : []),
    ],
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: messages.faq.items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  const jsonLd = !indexable ? [] : path === '/' ? [website, application, faq] : [application, breadcrumb];

  return {
    lang,
    title: page.title,
    description: page.description,
    canonical,
    robots: indexable ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, follow',
    ogLocale: messages.meta.ogLocale,
    ogImage: `${SITE_URL}/og-image-${lang}.png`,
    alternates,
    jsonLd,
  };
}

export interface HeadTag {
  tag: 'meta' | 'link' | 'script';
  attrs: Record<string, string>;
  content?: string;
}

/** The per-page <head> tags; `title` is set separately. */
export function headTags(seo: PageSeo): HeadTag[] {
  const otherLocale = seo.lang === 'en' ? 'es_ES' : 'en_US';
  return [
    { tag: 'meta', attrs: { name: 'description', content: seo.description } },
    { tag: 'meta', attrs: { name: 'robots', content: seo.robots } },
    { tag: 'link', attrs: { rel: 'canonical', href: seo.canonical } },
    ...seo.alternates.map((alt) => ({
      tag: 'link' as const,
      attrs: { rel: 'alternate', hreflang: alt.hreflang, href: alt.href },
    })),
    { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: SITE_NAME } },
    { tag: 'meta', attrs: { property: 'og:title', content: seo.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: seo.description } },
    { tag: 'meta', attrs: { property: 'og:url', content: seo.canonical } },
    { tag: 'meta', attrs: { property: 'og:image', content: seo.ogImage } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: seo.title } },
    { tag: 'meta', attrs: { property: 'og:locale', content: seo.ogLocale } },
    { tag: 'meta', attrs: { property: 'og:locale:alternate', content: otherLocale } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: seo.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: seo.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: seo.ogImage } },
    ...seo.jsonLd.map((data) => ({
      tag: 'script' as const,
      attrs: { type: 'application/ld+json' },
      // "<" is escaped so a value can never close the script element.
      content: JSON.stringify(data).replace(/</g, '\\u003c'),
    })),
  ];
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Static HTML for the prerendered <head>. Tags carry data-seo so the client can replace them on navigation. */
export function renderHeadHtml(seo: PageSeo): string {
  const tags = headTags(seo).map(({ tag, attrs, content }) => {
    const attributes = Object.entries({ ...attrs, 'data-seo': '' })
      .map(([key, value]) => (value === '' ? key : `${key}="${escapeHtml(value)}"`))
      .join(' ');
    return tag === 'script' ? `<script ${attributes}>${content ?? ''}</script>` : `<${tag} ${attributes} />`;
  });
  return [`<title>${escapeHtml(seo.title)}</title>`, ...tags].join('\n    ');
}
