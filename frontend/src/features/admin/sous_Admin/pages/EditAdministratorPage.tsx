import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { adminAdministratorsApi } from '../../api/administrators';
import type { AdminAdministratorRow } from '../../api/types';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import AdministratorAccountForm from '../components/AdministratorAccountForm';
import { isSuperAdminAdministrator } from '../utils/platformAdministratorUtils';
import { useAdminToast } from '../../dashboard/context/AdminToastContext';

const FORM_PREFIX = 'admin.forms.createAdministrator';

const EditAdministratorPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const backLabel = useAdminBackLabel('administrators');
  const goBack = () => navigate('/admin/admins');
  const { warning: toastWarning } = useAdminToast();
  const [administrator, setAdministrator] = useState<AdminAdministratorRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const adminId = Number(id);
    if (!adminId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    adminAdministratorsApi
      .get(adminId)
      .then((admin) => {
        if (isSuperAdminAdministrator(admin)) {
          toastWarning(t('admin.tables.administrators.superAdminProtected'));
          navigate('/admin/admins', { replace: true });
          return;
        }
        setAdministrator(admin);
      })
      .catch(() => setError(t('admin.common.notFound.administrator')))
      .finally(() => setLoading(false));
  }, [id, t, navigate, toastWarning]);

  if (loading) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-accent)]" aria-hidden />
        </div>
      </AdminFormPageShell>
    );
  }

  if (!administrator || error) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack}>
        <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/30 px-4 py-6 text-sm text-[var(--admin-text-secondary)]">
          {error || t('admin.common.notFound.administrator')}
        </p>
      </AdminFormPageShell>
    );
  }

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroTitle={t(`${FORM_PREFIX}.editTitle`)}
      heroSubtitle={t(`${FORM_PREFIX}.editSubtitle`)}
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.administrators'), onClick: goBack },
        { label: administrator.full_name },
      ]}
    >
      <AdministratorAccountForm
        hidePanelHeader
        mode="edit"
        administrator={administrator}
        onCancel={goBack}
        onSaved={goBack}
      />
    </AdminFormPageShell>
  );
};

export default EditAdministratorPage;
