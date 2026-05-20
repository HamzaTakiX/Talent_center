import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import AdminModulePageShell from '../../ui/AdminModulePageShell';
import AdminBackButton from '../../ui/AdminBackButton';
import { srfApi, srfRoutes, type SrfStudentFinancialDetail } from '../../api/srf';
import { SrfErrorState } from '../components/SrfModuleStates';
import SrfStudentDetailSkeleton from '../components/student-detail/SrfStudentDetailSkeleton';
import SrfStudentDetailView from '../components/student-detail/SrfStudentDetailView';

const StudentFinancialDetailPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const [detail, setDetail] = useState<SrfStudentFinancialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        <AdminBackButton onClick={() => navigate(srfRoutes.hub)} label={t('admin.modules.srf.detail.back')} className="mb-4" />
        <SrfStudentDetailSkeleton />
      </AdminModulePageShell>
    );
  }

  if (error || !detail) {
    return (
      <AdminModulePageShell width="wide">
        <AdminBackButton onClick={() => navigate(srfRoutes.hub)} label={t('admin.modules.srf.detail.back')} />
        <SrfErrorState onRetry={() => void load()} />
      </AdminModulePageShell>
    );
  }

  return (
    <AdminModulePageShell width="wide">
      <AdminBackButton onClick={() => navigate(srfRoutes.hub)} label={t('admin.modules.srf.detail.back')} className="mb-4" />
      <SrfStudentDetailView detail={detail} />
    </AdminModulePageShell>
  );
};

export default StudentFinancialDetailPage;
