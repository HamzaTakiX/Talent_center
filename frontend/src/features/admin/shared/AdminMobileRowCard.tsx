import { FunctionComponent, ReactNode } from 'react';

export interface AdminMobileRowCardField {
  label: string;
  value: ReactNode;
  compact?: boolean;
}

export interface AdminMobileRowCardProps {
  title?: ReactNode;
  badges?: ReactNode;
  meta?: ReactNode;
  fields?: readonly AdminMobileRowCardField[];
  actions?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const AdminMobileRowCard: FunctionComponent<AdminMobileRowCardProps> = ({
  title,
  badges,
  meta,
  fields,
  actions,
  className = '',
  onClick,
}) => (
  <div
    className={`admin-mobile-card${onClick ? ' admin-mobile-card--interactive' : ''} ${className}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }
        : undefined
    }
  >
    {(badges || title || meta) && (
      <div className="min-w-0 space-y-2">
        {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
        {title != null && title !== '' && (
          <div className="min-w-0 break-words text-sm font-semibold leading-5 text-[var(--admin-text)]">{title}</div>
        )}
        {meta != null && meta !== '' && (
          <p className="text-xs leading-4 text-[var(--admin-text-secondary)]">{meta}</p>
        )}
      </div>
    )}

    {fields && fields.length > 0 && (
      <dl className="grid min-w-0 gap-2.5 text-sm">
        {fields.map(({ label, value, compact }) => (
          <div
            key={label}
            className={
              compact
                ? 'grid min-w-0 gap-0.5 sm:grid-cols-[minmax(0,6rem)_1fr] sm:items-start sm:gap-x-3'
                : 'grid min-w-0 gap-0.5 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:items-start sm:gap-x-3'
            }
          >
            <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-[var(--admin-text-muted)] sm:pt-0.5">
              {label}
            </dt>
            <dd className="min-w-0 break-words text-sm leading-5 text-[var(--admin-text)]">{value}</dd>
          </div>
        ))}
      </dl>
    )}

    {actions != null && (
      <div
        className="admin-mobile-card__actions flex w-full min-w-0 flex-col gap-2 border-t border-[var(--admin-border)] pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2 sm:border-t-0 sm:pt-0"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {actions}
      </div>
    )}
  </div>
);

export default AdminMobileRowCard;
