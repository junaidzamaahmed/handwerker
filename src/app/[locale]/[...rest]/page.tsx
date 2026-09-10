import { notFound } from 'next/navigation';

/**
 * Without this, an unmatched URL never enters the `[locale]` segment, so Next serves its
 * own untranslated 404 instead of ours — with no phone number on it, which is the whole
 * point of a trades 404.
 */
export default function CatchAllNotFound() {
  notFound();
}
