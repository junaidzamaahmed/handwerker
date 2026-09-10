import { cache } from 'react';
import { listMdxSlugs, readMdx } from './fs';
import type { ProjectDoc } from './types';

function asProject(data: Record<string, unknown>, body: string): ProjectDoc {
  return { ...(data as unknown as Omit<ProjectDoc, 'body'>), featured: Boolean(data.featured), body };
}

export const getProject = cache(async (locale: string, slug: string): Promise<ProjectDoc | null> => {
  const doc = await readMdx(locale, `projects/${slug}.mdx`);
  if (!doc) return null;
  return asProject(doc.data, doc.body);
});

export const getProjects = cache(async (
  locale: string,
  filter?: { service?: string },
): Promise<ProjectDoc[]> => {
  const slugs = await listMdxSlugs(locale, 'projects');
  const docs = await Promise.all(slugs.map((slug) => getProject(locale, slug)));
  return docs
    .filter((d): d is ProjectDoc => d != null)
    .filter((d) => (filter?.service ? d.service === filter.service : true))
    .sort((a, b) => String(b.year).localeCompare(String(a.year)) || a.title.localeCompare(b.title, 'de'));
});
