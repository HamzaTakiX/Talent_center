import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { srfRoutes } from '../../api/srf';
import { useSrfPaymentProofQueue } from '../hooks/useSrfFinancial';
import { useAdminPagination } from '../../shared/hooks/useAdminPagination';
import AdminBadge from '../../ui/AdminBadge';
import { AdminPagination, AdminTableScroll } from '../../ui';
import { AdminMobileTableSkeleton, AdminTableSkeletonRows } from '../../ui/AdminTableSkeleton';
import { SrfEmptyState, SrfErrorState } from './SrfModuleStates';

const PendingValidationProofTable: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { proofs, loading, error, reload } = useSrfPaymentProofQueue();

  const { page, setPage, paginatedItems, totalItems, totalPages, pageSize } =
    useAdminPagination(proofs);

  if (error) {
    return <SrfErrorState onRetry={reload} />;
  }

  if (loading) {
    return (
      <div className="admin-module-panel p-4 space-y-4">
        <AdminMobileTableSkeleton count={3} />
        <div className="hidden lg:block">
          <AdminTableScroll minWidth="720px">
            <table className="w-full">
              <tbody>
                <AdminTableSkeletonRows colSpan={5} />
              </tbody>
            </table>
          </AdminTableScroll>
        </div>
      </div>
    );
  }

  if (proofs.length === 0) {
    return (
      <div className="admin-module-panel p-6">
        <SrfEmptyState
          titleKey="admin.empty.srfPendingValidation"
          descriptionKey="admin.empty.srfPendingValidationDesc"
        />
      </div>
    );
  }

  return (
    <div className="admin-module-panel overflow-hidden shadow-sm">
      <AdminTableScroll minWidth="720px">
        <table className="w-full text-sm text-start">
          <thead>
            <tr className="border-b border-[var(--admin-border)]">
              <th className="py-3 px-4">{t('admin.table.studentName', { defaultValue: 'Student' })}</th>
              <th className="py-3 px-4">{t('admin.srf.amount', { defaultValue: 'Amount' })}</th>
              <th className="py-3 px-4">{t('admin.srf.reference', { defaultValue: 'Reference' })}</th>
              <th className="py-3 px-4">{t('admin.table.status', { defaultValue: 'Status' })}</th>
              <th className="py-3 px-4 text-end">{t('admin.table.actions', { defaultValue: 'Actions' })}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((p) => (
              <tr key={p.id} className="border-b border-[var(--admin-border)]/60 hover:bg-muted/20">
                <td className="py-3 px-4 font-medium">{p.student_name}</td>
                <td className="py-3 px-4 tabular-nums">
                  {p.amount} {p.currency}
                </td>
                <td className="py-3 px-4">{p.reference_number || '—'}</td>
                <td className="py-3 px-4">
                  <AdminBadge variant="info">{p.status}</AdminBadge>
                </td>
                <td className="py-3 px-4 text-end">
                  <button
                    type="button"
                    onClick={() => navigate(srfRoutes.validation(p.id))}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--admin-brand)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {t('admin.modules.srf.validation.openReview')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableScroll>
      <div className="p-4">
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          itemLabel={t('admin.pagination.srfProofs', { defaultValue: 'justificatifs' })}
        />
      </div>
    </div>
  );
};

export default PendingValidationProofTable;
