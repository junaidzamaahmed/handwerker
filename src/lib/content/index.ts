import { cache } from 'react';
import { listMdxSlugs, readMdx } from './fs';
import type { ArticleDoc, JobDoc, TeamMember } from './types';

export { getHome, getAbout, getContact, getServicesIndex, getIndexCopy, getEmergency } from './pages';
export { getService, getServices } from './services';
export { getProject, getProjects } from './projects';
export { getLegalPage } from './legal';
export { getReviewData } from './reviews';

export const getTeam = cache(async (locale: string): Promise<TeamMember[]> => {
  const slugs = await listMdxSlugs(locale, 'team');
  const docs = await Promise.all(
    slugs.map(async (slug) => {
      const doc = await readMdx(locale, `team/${slug}.mdx`);
      if (!doc) return null;
      return doc.data as unknown as TeamMember;
    }),
  );
  return docs.filter((d): d is TeamMember => d != null);
});

export const getJobs = cache(async (locale: string): Promise<JobDoc[]> => {
  const slugs = await listMdxSlugs(locale, 'jobs');
  const docs = await Promise.all(
    slugs.map(async (slug) => {
      const doc = await readMdx(locale, `jobs/${slug}.mdx`);
      if (!doc) return null;
      return { ...(doc.data as unknown as Omit<JobDoc, 'body'>), body: doc.body };
    }),
  );
  return docs.filter((d): d is JobDoc => d != null);
});

export const getArticle = cache(async (locale: string, slug: string): Promise<ArticleDoc | null> => {
  const doc = await readMdx(locale, `ratgeber/${slug}.mdx`);
  if (!doc) return null;
  const data = doc.data as unknown as Omit<ArticleDoc, 'body'>;
  const readingMinutes =
    data.readingMinutes ?? Math.max(1, Math.round(doc.body.split(/\s+/).length / 200));
  return { ...data, readingMinutes, body: doc.body };
});

export const getArticles = cache(async (locale: string): Promise<ArticleDoc[]> => {
  const slugs = await listMdxSlugs(locale, 'ratgeber');
  const docs = await Promise.all(slugs.map((slug) => getArticle(locale, slug)));
  return docs
    .filter((d): d is ArticleDoc => d != null)
    .sort((a, b) => b.date.localeCompare(a.date));
});
