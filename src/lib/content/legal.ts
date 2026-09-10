import { cache } from 'react';
import { interpolate } from '@/lib/legal/interpolate';
import { readMdx } from './fs';
import type { LegalPage } from './types';

export const getLegalPage = cache(async (locale: string, slug: string): Promise<LegalPage | null> => {
  const doc = await readMdx(locale, `legal/${slug}.mdx`);
  if (!doc) return null;
  const data = doc.data as { slug: string; title: string; lead: string };
  return {
    slug: data.slug,
    title: interpolate(data.title),
    lead: interpolate(data.lead),
    body: interpolate(doc.body),
  };
});
