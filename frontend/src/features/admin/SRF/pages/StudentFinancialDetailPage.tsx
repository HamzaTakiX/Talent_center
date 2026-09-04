import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminBackButton from '../../ui/AdminBackButton';
import { srfApi, srfRoutes, type SrfStudentFinancialDetail } from '../../api/srf';
import { SrfErrorState } from '../components/SrfModuleStates';
import SrfStudentDetailSkeleton from '../components/student-detail/SrfStudentDetailSkeleton';
import SrfStudentDetailView from '../components/student-detail/SrfStudentDetailView';
import '../styles/admin-srf.css';

const StudentFinancialDetailPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const [detail, setDetail] = useState<SrfStudentFinancialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const backLabel = t('admin.modules.srf.detail.back');
  const goBack = useCallback(() => navigate(srfRoutes.hub), [navigate]);

  const load = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(false);
    try {
      const data = await srfApi.getStudentDetail(Number(accountId));
      setDetail(data);
    } catch {
      setError(true);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <AdminModulePageShell width="wide">
        <AdminBackButton onClick={goBack} label={backLabel} className="mb-4 w-fit shrink-0" />
        <SrfStudentDetailSkeleton />
      </AdminModulePageShell>
    );
  }

  if (error || !detail) {
    return (
      <AdminModulePageShell width="wide">
        <AdminBackButton onClick={goBack} label={backLabel} className="mb-4 w-fit shrink-0" />
        <SrfErrorState onRetry={() => void load()} />
      </AdminModulePageShell>
    );
  }

  return (
    <AdminModulePageShell width="wide">
      <SrfStudentDetailView detail={detail} backLabel={backLabel} onBack={goBack} />
    </AdminModulePageShell>
  );
};

export default StudentFinancialDetailPage;
