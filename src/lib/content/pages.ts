import { cache } from 'react';
import { readMdx } from './fs';
import type { AboutPage, ContactPage, EmergencyPage, HomePage, IndexCopy, ServicesIndex } from './types';

export const getHome = cache(async (locale: string): Promise<HomePage | null> => {
  const doc = await readMdx(locale, 'pages/home.mdx');
  if (!doc) return null;
  return doc.data as unknown as HomePage;
});

export const getAbout = cache(async (locale: string): Promise<AboutPage | null> => {
  const doc = await readMdx(locale, 'pages/ueber-uns.mdx');
  if (!doc) return null;
  return doc.data as unknown as AboutPage;
});

export const getContact = cache(async (locale: string): Promise<ContactPage | null> => {
  const doc = await readMdx(locale, 'pages/kontakt.mdx');
  if (!doc) return null;
  return doc.data as unknown as ContactPage;
});

export const getServicesIndex = cache(async (locale: string): Promise<ServicesIndex | null> => {
  const doc = await readMdx(locale, 'pages/leistungen.mdx');
  if (!doc) return null;
  return doc.data as unknown as ServicesIndex;
});

export type IndexSlug = 'referenzen' | 'bewertungen' | 'ratgeber' | 'jobs';

export const getIndexCopy = cache(async (locale: string, slug: IndexSlug): Promise<IndexCopy | null> => {
  const doc = await readMdx(locale, `pages/${slug}.mdx`);
  if (!doc) return null;
  return doc.data as unknown as IndexCopy;
});

export const getEmergency = cache(async (locale: string): Promise<EmergencyPage | null> => {
  const doc = await readMdx(locale, 'pages/notdienst.mdx');
  if (!doc) return null;
  return doc.data as unknown as EmergencyPage;
});
