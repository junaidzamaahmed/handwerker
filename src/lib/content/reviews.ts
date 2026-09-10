import fs from 'node:fs';
import path from 'node:path';
import type { ReviewData } from './types';

/**
 * Compiled by hand from the public Google profile. Read synchronously because the
 * reviews page and JSON-LD both need it during a static render and the file is tiny.
 */
export function getReviewData(): ReviewData | null {
  const file = path.join(process.cwd(), 'content', 'reviews.json');
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as ReviewData;
    if (typeof data.rating !== 'number' || typeof data.total !== 'number') return null;
    return data;
  } catch {
    return null;
  }
}
