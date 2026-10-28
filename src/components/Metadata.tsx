import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageMetadata, safeJson } from '../seo';
export function Metadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = pageMetadata(pathname);
    document.head.querySelectorAll('[data-seo]').forEach(node => node.remove());
    document.title = meta.title;
    const tags = [
      ['name', 'description', meta.description], ['name', 'robots', meta.index ? 'index,follow' : 'noindex,nofollow'],
      ['property', 'og:title', meta.title], ['property', 'og:description', meta.description],
      ['property', 'og:type', meta.type], ['property', 'og:url', meta.canonical],
      ['property', 'og:site_name', 'Bright Copter'], ['property', 'og:locale', 'en_IN'],
      ['property', 'og:image', meta.image], ['property', 'og:image:alt', meta.imageAlt],
      ['property', 'og:image:width', '1200'], ['property', 'og:image:height', '630'], ['property', 'og:image:type', 'image/jpeg'],
      ['name', 'twitter:card', 'summary_large_image'], ['name', 'twitter:title', meta.title],
      ['name', 'twitter:description', meta.description], ['name', 'twitter:image', meta.image], ['name', 'twitter:image:alt', meta.imageAlt],
    ];
    tags.forEach(([key, name, value]) => { const tag = document.createElement('meta'); tag.setAttribute(key, name); tag.content = value; tag.dataset.seo = ''; document.head.append(tag); });
    if (meta.index) { const link = document.createElement('link'); link.rel = 'canonical'; link.href = meta.canonical; link.dataset.seo = ''; document.head.append(link); }
    const script = document.createElement('script'); script.type = 'application/ld+json'; script.dataset.seo = ''; script.textContent = safeJson(meta.schema); document.head.append(script);
  }, [pathname]);
  return null;
}
