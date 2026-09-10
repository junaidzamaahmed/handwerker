import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Use these, never `next/link` directly. They resolve the translated slug for the active
 * locale — importing `next/link` produces a German URL on the English site and nobody
 * notices until a customer reports a 404.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
