import { Link } from 'react-router';

interface EmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaTo?: string;
  onCta?: () => void;
}

export default function EmptyState({ title, description, ctaLabel, ctaTo, onCta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-strong px-6 py-16 text-center">
      <img src="/empty-state.svg" alt="" className="h-24 w-24 opacity-80" />
      <h3 className="mt-6 text-lg font-medium text-text">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>}
      {ctaLabel &&
        (ctaTo ? (
          <Link
            to={ctaTo}
            className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:-translate-y-px hover:brightness-110"
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            onClick={onCta}
            className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg transition-all hover:-translate-y-px hover:brightness-110"
          >
            {ctaLabel}
          </button>
        ))}
    </div>
  );
}
