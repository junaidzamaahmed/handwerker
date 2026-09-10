import { Icon } from '@/components/ui/Icon';

export function ReviewCard({
  quote,
  author,
  rating,
}: {
  quote: string;
  author: string;
  rating?: number;
}) {
  return (
    <figure className="flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-card">
      {typeof rating === 'number' && (
        <div className="flex gap-0.5" aria-label={`${rating} / 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Icon
              key={i}
              name="star"
              size={16}
              className={i < Math.round(rating) ? 'text-warning' : 'text-line-strong'}
            />
          ))}
        </div>
      )}
      <blockquote className="mt-3 flex-1 text-ink-soft">{quote}</blockquote>
      <figcaption className="mt-4 text-sm font-medium text-ink">{author}</figcaption>
    </figure>
  );
}
