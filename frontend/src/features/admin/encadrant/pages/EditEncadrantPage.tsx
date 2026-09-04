import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import { AdminPanelListSkeleton } from '../../ui';
import EncadrantAccountForm from '../components/EncadrantAccountForm';
import EncadrantFormPageHero from '../components/EncadrantFormPageHero';
import { adminEncadrantsApi } from '../../api/encadrants';
import type { AdminEncadrantRow } from '../../api/types';

const EditEncadrantPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const backLabel = useAdminBackLabel('encadrants');
  const goBack = () => navigate('/admin/encadrants');

  const [encadrant, setEncadrant] = useState<AdminEncadrantRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const encId = Number(id);
    if (!id || Number.isNaN(encId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    adminEncadrantsApi
      .get(encId)
      .then(setEncadrant)
      .catch(() => setEncadrant(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack} width="narrow">
        <AdminPanelListSkeleton rows={8} />
      </AdminFormPageShell>
    );
  }

  if (!encadrant) {
    return (
      <AdminFormPageShell backLabel={backLabel} onBack={goBack} width="narrow">
        <p className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/30 px-4 py-6 text-sm text-[var(--admin-text-secondary)]">
          {t('admin.common.notFound.encadrant')}
        </p>
      </AdminFormPageShell>
    );
  }

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      width="narrow"
      heroContent={
        <EncadrantFormPageHero mode="edit" displayName={encadrant.full_name} />
      }
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.encadrants'), onClick: goBack },
        { label: encadrant.full_name },
      ]}
    >
      <EncadrantAccountForm
        mode="edit"
        encadrant={encadrant}
        hidePanelHeader
        onCancel={goBack}
        onSaved={goBack}
      />
    </AdminFormPageShell>
  );
};

export default EditEncadrantPage;
