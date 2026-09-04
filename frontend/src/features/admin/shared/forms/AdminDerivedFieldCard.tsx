import { FunctionComponent, ReactNode } from 'react';
import { Loader2, Sparkles, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type AdminDerivedFieldStatus = 'idle' | 'loading' | 'resolved' | 'empty' | 'warning';

interface AdminDerivedFieldCardProps {
  id: string;
  label: string;
  hint?: string;
  /** Show the sparkles AUTO badge beside the label. */
  autoBadge?: boolean;
  status?: AdminDerivedFieldStatus;
  /** Read-only resolved value (student auto internship). */
  value?: string;
  loadingLabel?: string;
  emptyLabel?: string;
  children?: ReactNode;
  error?: string;
  /** Compact layout for 2-column form grids — matches select field height. */
  compact?: boolean;
}

const AdminDerivedFieldCard: FunctionComponent<AdminDerivedFieldCardProps> = ({
  id,
  label,
  hint,
  autoBadge = false,
  status = 'idle',
  value,
  loadingLabel,
  emptyLabel,
  children,
  error,
  compact = false,
}) => {
  const { t } = useTranslation();
  const resolved = status === 'resolved' && Boolean(value?.trim());
  const isLoading = status === 'loading';
  const isEmpty = status === 'empty' || (!resolved && !isLoading && !children && status !== 'warning');
  const isWarning = status === 'warning';

  return (
    <div
      className={[
        'admin-form-field admin-derived-field',
        compact ? 'admin-derived-field--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="admin-derived-field__label-row">
        <label className="admin-derived-field__label" htmlFor={id}>
          {label}
        </label>
        {autoBadge ? (
          <span className="admin-derived-field__badge" aria-hidden>
            <Sparkles className="h-3 w-3 shrink-0" strokeWidth={2.25} />
            {t('admin.common.auto', { defaultValue: 'Auto' })}
          </span>
        ) : null}
      </div>

      {compact && hint ? (
        <p className="admin-derived-field__hint admin-derived-field__hint--compact">{hint}</p>
      ) : null}

      <div
        className={[
          'admin-derived-field__card',
          compact ? 'admin-derived-field__card--compact' : '',
          resolved ? 'admin-derived-field__card--resolved' : '',
          isEmpty ? 'admin-derived-field__card--empty' : '',
          isWarning ? 'admin-derived-field__card--warning' : '',
          isLoading ? 'admin-derived-field__card--loading' : '',
          error ? 'admin-derived-field__card--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {!compact ? <div className="admin-derived-field__glow" aria-hidden /> : null}

        {!compact && hint ? <p className="admin-derived-field__hint">{hint}</p> : null}

        {children ? (
          <div className="admin-derived-field__content">{children}</div>
        ) : (
          <div
            id={id}
            className={[
              'admin-derived-field__value',
              resolved ? 'admin-derived-field__value--resolved' : '',
              isEmpty ? 'admin-derived-field__value--empty' : '',
              isWarning ? 'admin-derived-field__value--warning' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-live="polite"
          >
            {isLoading ? (
              <>
                <span className="admin-derived-field__value-icon admin-derived-field__value-icon--loading">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden strokeWidth={2} />
                </span>
                <span>{loadingLabel ?? t('admin.common.loading', { defaultValue: 'Loading…' })}</span>
              </>
            ) : (
              <>
                <span
                  className={[
                    'admin-derived-field__value-icon',
                    resolved ? 'admin-derived-field__value-icon--resolved' : '',
                    isWarning ? 'admin-derived-field__value-icon--warning' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden
                >
                  <Zap className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="admin-derived-field__value-text">
                  {value?.trim() || emptyLabel || '—'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {error ? <p className="admin-form-field-error mt-1.5">{error}</p> : null}
    </div>
  );
};

export default AdminDerivedFieldCard;
