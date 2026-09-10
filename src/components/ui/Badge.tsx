import { Icon, type IconName } from './Icon';

type Intent = 'neutral' | 'brand' | 'success' | 'warning' | 'emergency';

const intents: Record<Intent, string> = {
  neutral: 'bg-sunken text-ink-soft border-line',
  brand: 'bg-brand-soft text-ink-brand border-line-brand/30',
  success: 'bg-success-soft text-success border-success/25',
  warning: 'bg-warning-soft text-warning border-warning/25',
  emergency: 'bg-danger-soft text-danger border-danger/25',
};

export function Badge({
  children,
  intent = 'neutral',
  icon,
}: {
  children: React.ReactNode;
  intent?: Intent;
  icon?: IconName;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-chip border px-2.5 py-1 text-xs font-medium ${intents[intent]}`}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
