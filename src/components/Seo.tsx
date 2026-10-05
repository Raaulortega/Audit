import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { splitLocalePath } from '../i18n/paths';
import { getPageSeo, headTags } from '../seo/seo';

/**
 * Keeps <head> in sync with the current route after client-side navigation.
 * The first page load already ships the same tags from the prerendered HTML.
 */
export function Seo() {
  const { pathname } = useLocation();
  const { lang, t } = useI18n();

  useEffect(() => {
    const seo = getPageSeo(splitLocalePath(pathname).path, lang, t);
    document.title = seo.title;
    document.head.querySelectorAll('[data-seo]').forEach((element) => element.remove());
    for (const { tag, attrs, content } of headTags(seo)) {
      const element = document.createElement(tag);
      for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
      element.setAttribute('data-seo', '');
      if (content) element.textContent = content;
      document.head.appendChild(element);
    }
  }, [pathname, lang, t]);

  return null;
}
