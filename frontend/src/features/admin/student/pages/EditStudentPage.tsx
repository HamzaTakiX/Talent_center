import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import { adminStudentsApi } from '../../api/students';
import type { AdminStudentDetail } from '../../api/types';
import AdminFormPageShell from '../../ui/AdminFormPageShell';
import StudentAccountForm from '../components/StudentAccountForm';
import StudentEditPageHero from '../components/StudentEditPageHero';
import StudentEditPageSkeleton, { StudentEditHeroSkeleton } from '../components/StudentEditPageSkeleton';

const FORM_PREFIX = 'admin.forms.createStudent';

const EditStudentPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const backLabel = useAdminBackLabel('students');
  const goBack = () => navigate('/admin/students');

  const [student, setStudent] = useState<AdminStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError(t(`${FORM_PREFIX}.messages.invalidStudentId`));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    adminStudentsApi
      .get(Number(id))
      .then(setStudent)
      .catch(() => setError(t(`${FORM_PREFIX}.messages.loadStudentError`)))
      .finally(() => setLoading(false));
  }, [id, t]);

  const heroContent = loading
    ? <StudentEditHeroSkeleton />
    : student
      ? <StudentEditPageHero student={student} />
      : undefined;

  return (
    <AdminFormPageShell
      backLabel={backLabel}
      onBack={goBack}
      heroContent={heroContent}
      heroTitle={!loading && !student ? t(`${FORM_PREFIX}.editTitle`) : undefined}
      heroSubtitle={!loading && !student ? t(`${FORM_PREFIX}.editSubtitle`) : undefined}
      breadcrumbs={[
        { label: t('admin.common.breadcrumbs.students'), onClick: goBack },
        { label: student?.full_name ?? t('admin.common.actions.edit') },
      ]}
    >
      {loading ? <StudentEditPageSkeleton /> : null}

      {!loading && error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && student && (
        <StudentAccountForm
          hidePanelHeader
          stickyActions={false}
          mode="edit"
          student={student}
          onCancel={goBack}
          onSaved={goBack}
        />
      )}
    </AdminFormPageShell>
  );
};

export default EditStudentPage;
