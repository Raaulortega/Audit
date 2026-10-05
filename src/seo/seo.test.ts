import { describe, expect, it } from 'vitest';
import { en } from '../i18n/en';
import { es } from '../i18n/es';
import { LANGUAGES, NOINDEX_PATHS, PAGE_PATHS, localizePath, splitLocalePath } from '../i18n/paths';
import { getPageSeo, renderHeadHtml, SITE_URL } from './seo';

const MESSAGES = { en, es };

describe('localized paths', () => {
  it('round-trips every page in every language', () => {
    for (const lang of LANGUAGES) {
      for (const path of PAGE_PATHS) {
        expect(splitLocalePath(localizePath(path, lang))).toEqual({ lang, path });
      }
    }
  });

  it('keeps English at the root and Spanish under /es', () => {
    expect(localizePath('/', 'en')).toBe('/');
    expect(localizePath('/', 'es')).toBe('/es');
    expect(localizePath('/jwt', 'es')).toBe('/es/jwt');
    expect(splitLocalePath('/es/')).toEqual({ lang: 'es', path: '/' });
    expect(splitLocalePath('/essay')).toEqual({ lang: 'en', path: '/essay' });
  });
});

describe('page SEO', () => {
  for (const lang of LANGUAGES) {
    for (const path of PAGE_PATHS) {
      it(`${lang} ${path}: fits search-result limits and links both languages`, () => {
        const seo = getPageSeo(path, lang, MESSAGES[lang]);
        expect(seo.title.length).toBeLessThanOrEqual(60);
        expect(seo.title).toContain('LocalAudit');
        expect(seo.description.length).toBeGreaterThanOrEqual(70);
        expect(seo.description.length).toBeLessThanOrEqual(160);
        expect(seo.canonical).toBe(`${SITE_URL}${localizePath(path, lang)}`);
        expect(seo.alternates.map((alt) => alt.hreflang)).toEqual(['en', 'es', 'x-default']);
        if (NOINDEX_PATHS.has(path)) {
          expect(seo.robots).toMatch(/^noindex/);
          expect(seo.jsonLd).toEqual([]);
        } else {
          expect(seo.robots).toMatch(/^index/);
          expect(seo.jsonLd.length).toBeGreaterThan(0);
        }
      });
    }
  }

  it('gives every page a unique title per language', () => {
    for (const lang of LANGUAGES) {
      const titles = PAGE_PATHS.map((path) => getPageSeo(path, lang, MESSAGES[lang]).title);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });

  it('marks unknown URLs as noindex without alternates', () => {
    const seo = getPageSeo('/does-not-exist', 'es', es);
    expect(seo.robots).toMatch(/^noindex/);
    expect(seo.alternates).toEqual([]);
    expect(seo.title).toBe(es.seo.notFound.title);
  });

  it('ships FAQ structured data on the home page that matches the visible FAQ', () => {
    const faq = getPageSeo('/', 'en', en).jsonLd.find((data) => (data as { '@type': string })['@type'] === 'FAQPage') as {
      mainEntity: Array<{ name: string }>;
    };
    expect(faq.mainEntity.map((entry) => entry.name)).toEqual(en.faq.items.map((item) => item.question));
  });

  it('escapes HTML in the rendered head so text can never break out of a tag', () => {
    const html = renderHeadHtml({ ...getPageSeo('/', 'en', en), title: '</title><script>x</script>', jsonLd: [{ a: '</script>' }] });
    expect(html).not.toContain('<script>x');
    expect(html).toContain('\\u003c/script>');
  });
});

describe('i18n SEO parity', () => {
  it('has Spanish SEO copy and the same number of FAQ entries for every English page', () => {
    expect(Object.keys(es.seo.pages).sort()).toEqual(Object.keys(en.seo.pages).sort());
    expect(Object.keys(en.seo.pages).sort()).toEqual([...PAGE_PATHS].sort());
    expect(es.faq.items).toHaveLength(en.faq.items.length);
    expect(es.seo.features).toHaveLength(en.seo.features.length);
  });
});
