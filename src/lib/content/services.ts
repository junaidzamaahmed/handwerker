import { cache } from 'react';
import type { IconName } from '@/components/ui/Icon';
import { listMdxSlugs, readMdx } from './fs';
import type { ServiceDoc } from './types';

function asService(data: Record<string, unknown>, body: string): ServiceDoc {
  return {
    ...(data as unknown as Omit<ServiceDoc, 'body' | 'icon'>),
    icon: data.icon as IconName,
    body,
  };
}

export const getService = cache(async (locale: string, slug: string): Promise<ServiceDoc | null> => {
  const doc = await readMdx(locale, `services/${slug}.mdx`);
  if (!doc) return null;
  return asService(doc.data, doc.body);
});

export const getServices = cache(async (locale: string): Promise<ServiceDoc[]> => {
  const slugs = await listMdxSlugs(locale, 'services');
  const docs = await Promise.all(slugs.map((slug) => getService(locale, slug)));
  return docs
    .filter((d): d is ServiceDoc => d != null)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'de'));
});
