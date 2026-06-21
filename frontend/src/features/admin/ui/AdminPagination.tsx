import { FunctionComponent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PAGINATION_PREFIX = 'admin.pagination';

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

const AdminPagination: FunctionComponent<AdminPaginationProps> = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel,
}) => {
  const { t } = useTranslation();
  const resolvedItemLabel = itemLabel ?? t(`${PAGINATION_PREFIX}.items`, { defaultValue: 'items' });

  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    if (totalPages <= 7) return true;
    return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
  });

  const statusText =
    totalItems === 0
      ? t(`${PAGINATION_PREFIX}.empty`, {
          itemLabel: resolvedItemLabel,
          defaultValue: `No ${resolvedItemLabel}`,
        })
      : t(`${PAGINATION_PREFIX}.range`, {
          start,
          end,
          total: totalItems,
          itemLabel: resolvedItemLabel,
          defaultValue: `Showing ${start}–${end} of ${totalItems} ${resolvedItemLabel}`,
        });

  return (
    <nav className="admin-pagination" aria-label={t(`${PAGINATION_PREFIX}.ariaLabel`, { defaultValue: 'Pagination' })}>
      <p className="text-sm text-[var(--admin-text-secondary)]">{statusText}</p>
      <div className="admin-pagination-pages">
        <button
          type="button"
          className="admin-pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t(`${PAGINATION_PREFIX}.previous`, { defaultValue: 'Previous page' })}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        {pages.map((p, idx) => {
          const prev = pages[idx - 1];
          const showEllipsis = prev != null && p - prev > 1;
          return (
            <span key={p} className="inline-flex items-center gap-0.5">
              {showEllipsis && (
                <span className="px-1 text-[var(--admin-text-muted)]" aria-hidden>
                  …
                </span>
              )}
              <button
                type="button"
                className={`admin-pagination-btn ${p === page ? 'admin-pagination-btn--active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          className="admin-pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t(`${PAGINATION_PREFIX}.next`, { defaultValue: 'Next page' })}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
};

export default AdminPagination;
