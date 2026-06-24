import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AdminModal from '../../../ui/AdminModal';
import { adminAdministratorsApi } from '../../../api/administrators';
import type { AdminAdministratorRow } from '../../../api/types';
import { useInternshipInboxCopy } from '../../hooks/useOffersListLabels';
import {
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
} from '../../../shared/forms/adminFormClasses';

type Props = {
  open: boolean;
  onClose: () => void;
  onAssign: (assigneeUserId: number) => Promise<void>;
};

const InternshipAssignAdminModal: FunctionComponent<Props> = ({ open, onClose, onAssign }) => {
  const { t } = useInternshipInboxCopy();
  const [admins, setAdmins] = useState<AdminAdministratorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedId(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void adminAdministratorsApi
      .list({ status: 'active', page_size: 100 })
      .then((result) => {
        if (cancelled) return;
        setAdmins(result.items.filter((admin) => admin.is_active && admin.is_admin_active));
      })
      .catch(() => {
        if (!cancelled) setAdmins([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (admin) =>
        admin.full_name.toLowerCase().includes(q) || admin.email.toLowerCase().includes(q),
    );
  }, [admins, search]);

  const handleAssign = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await onAssign(selectedId);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t('assignAdminModal.title')}
      description={t('assignAdminModal.description')}
      maxWidthClass="max-w-[480px]"
      footer={
        <div className="flex w-full justify-end gap-2">
          <button type="button" className={adminFormBtnSecondaryClass} onClick={onClose} disabled={submitting}>
            {t('assignAdminModal.cancel')}
          </button>
          <button
            type="button"
            className={adminFormBtnPrimaryClass}
            onClick={() => void handleAssign()}
            disabled={!selectedId || submitting}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {t('assignAdminModal.confirm')}
          </button>
        </div>
      }
    >
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('assignAdminModal.searchPlaceholder')}
        className="admin-form-input mb-3 h-10 w-full text-sm"
        autoFocus
      />
      <div className="max-h-72 overflow-y-auto rounded-xl border border-[var(--admin-border)]">
        {loading ? (
          <p className="m-0 px-4 py-6 text-center text-sm text-[var(--admin-text-secondary)]">
            {t('assignAdminModal.loading')}
          </p>
        ) : filteredAdmins.length === 0 ? (
          <p className="m-0 px-4 py-6 text-center text-sm text-[var(--admin-text-secondary)]">
            {t('assignAdminModal.empty')}
          </p>
        ) : (
          <ul className="m-0 list-none divide-y divide-[var(--admin-border)] p-0">
            {filteredAdmins.map((admin) => {
              const isSelected = selectedId === admin.id;
              return (
                <li key={admin.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(admin.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected ? 'bg-[var(--admin-brand-muted)]' : 'hover:bg-[var(--admin-row-hover)]'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[var(--admin-text)]">
                        {admin.full_name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[var(--admin-text-secondary)]">
                        {admin.email}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminModal>
  );
};

export default InternshipAssignAdminModal;
