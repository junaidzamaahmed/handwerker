import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { cache } from 'react';
import { siteConfig } from '@/lib/config';

const ROOT = path.join(process.cwd(), 'content');

export interface ParsedMdx {
  data: Record<string, unknown>;
  body: string;
  locale: string;
  file: string;
}

function localeOrder(requested: string): string[] {
  const fallback = siteConfig.i18n.defaultLocale;
  return requested === fallback ? [requested] : [requested, fallback];
}

async function readFileIfExists(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

/** Read one MDX file, falling back to the default locale when the requested one is missing. */
export const readMdx = cache(async (locale: string, relative: string): Promise<ParsedMdx | null> => {
  for (const loc of localeOrder(locale)) {
    const file = path.join(ROOT, loc, relative);
    const raw = await readFileIfExists(file);
    if (raw == null) continue;
    const parsed = matter(raw);
    return { data: parsed.data as Record<string, unknown>, body: parsed.content.trim(), locale: loc, file };
  }
  return null;
});

/** List `.mdx` slugs in a folder, preferring files from the requested locale. */
export const listMdxSlugs = cache(async (locale: string, folder: string): Promise<string[]> => {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const loc of localeOrder(locale)) {
    let names: string[];
    try {
      names = await fs.readdir(path.join(ROOT, loc, folder));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw err;
    }
    for (const name of names) {
      if (!name.endsWith('.mdx')) continue;
      const slug = name.slice(0, -4);
      if (seen.has(slug)) continue;
      seen.add(slug);
      slugs.push(slug);
    }
  }
  return slugs;
});

export async function readJsonFile<T>(relative: string): Promise<T | null> {
  const file = path.join(ROOT, relative);
  const raw = await readFileIfExists(file);
  if (raw == null) return null;
  return JSON.parse(raw) as T;
}
