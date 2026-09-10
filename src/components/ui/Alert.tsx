import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type AlertType = 'info' | 'success' | 'warning' | 'error';

const styles: Record<AlertType, { wrap: string; icon: IconName; fg: string }> = {
  info: { wrap: 'bg-info-soft', icon: 'info', fg: 'text-info' },
  success: { wrap: 'bg-success-soft', icon: 'check', fg: 'text-success' },
  warning: { wrap: 'bg-warning-soft', icon: 'alert-triangle', fg: 'text-warning' },
  error: { wrap: 'bg-danger-soft', icon: 'alert-triangle', fg: 'text-danger' },
};

/**
 * Never colour-only. The icon and the bold title carry the meaning as well as the tint —
 * roughly 8% of the men who make up most of this customer base cannot rely on red/green.
 *
 * `role="alert"` is for messages that appear in response to an action. A static note that
 * is on the page from the start should leave it off, or screen readers announce it on load.
 */
export function Alert({
  type = 'info',
  title,
  children,
  live = false,
  id,
}: {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  live?: boolean;
  id?: string;
}) {
  const s = styles[type];
  return (
    <div
      id={id}
      className={`flex gap-3 rounded-control p-4 ${s.wrap}`}
      role={live ? 'alert' : undefined}
      aria-live={live ? 'polite' : undefined}
    >
      <Icon name={s.icon} size={22} className={`mt-0.5 shrink-0 ${s.fg}`} />
      <div className="min-w-0">
        {title && <p className={`font-semibold ${s.fg}`}>{title}</p>}
        <div className="text-ink-soft [&>*+*]:mt-2">{children}</div>
      </div>
    </div>
  );
}
