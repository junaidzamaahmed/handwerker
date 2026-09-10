import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/lib/i18n/navigation';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'emergency';
type Size = 'lg' | 'md';

const variants: Record<Variant, string> = {
  primary: 'bg-cta text-on-cta hover:bg-cta-hover',
  secondary: 'bg-surface text-ink-brand border border-line-brand hover:bg-brand-soft',
  // Ghost is transparent with a brand-coloured label. It is only legible on page, subtle
  // and surface backgrounds. On bg-brand, bg-emergency or bg-inverse the label is
  // brand-on-brand and effectively invisible — use `secondary` there, plus a plain text
  // link if a second action is needed.
  ghost: 'bg-transparent text-ink-brand hover:bg-brand-soft',
  emergency: 'bg-sos text-on-sos hover:bg-sos-hover',
};

const sizes: Record<Size, string> = {
  lg: 'px-6 py-4 text-base gap-3',
  md: 'px-5 py-3 text-sm gap-2',
};

const base =
  'inline-flex items-center justify-center rounded-control font-semibold ' +
  'transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ' +
  'disabled:bg-sunken disabled:text-ink-muted disabled:border-line';

interface Common {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconAfter?: IconName;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = Common & Omit<ComponentProps<'button'>, keyof Common>;

/**
 * Deliberately a narrow prop set rather than all of ComponentProps<'a'>. next-intl's Link
 * and React 19's anchor types disagree on a handful of newer attributes (`popover`), and
 * a button link needs none of them.
 */
type LinkExtras = {
  target?: string;
  rel?: string;
  download?: boolean | string;
  id?: string;
  title?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
};
type ButtonAsLink = Common & { href: string } & LinkExtras;

function classes({ variant = 'primary', size = 'lg', fullWidth, className }: Common) {
  return [base, variants[variant], sizes[size], fullWidth ? 'w-full' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
}

export function Button(props: ButtonAsButton) {
  const { variant, size, icon, iconAfter, fullWidth, children, className, ...rest } = props;
  return (
    <button className={classes({ variant, size, fullWidth, className, children })} {...rest}>
      {icon && <Icon name={icon} size={20} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={20} />}
    </button>
  );
}

/**
 * Internal links go through next-intl's `Link` so the translated slug resolves. External
 * and `tel:` / `mailto:` / `https:` hrefs fall through to a plain anchor.
 */
export function ButtonLink(props: ButtonAsLink) {
  const { variant, size, icon, iconAfter, fullWidth, children, className, href, ...rest } = props;
  const cls = classes({ variant, size, fullWidth, className, children });
  const content = (
    <>
      {icon && <Icon name={icon} size={20} />}
      {children}
      {iconAfter && <Icon name={iconAfter} size={20} />}
    </>
  );
  const isExternal = /^(https?:|tel:|mailto:|#)/.test(href);
  if (isExternal) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href as Parameters<typeof Link>[0]['href']} className={cls} {...rest}>
      {content}
    </Link>
  );
}
