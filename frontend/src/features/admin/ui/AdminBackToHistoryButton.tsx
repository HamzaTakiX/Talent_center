import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminBackLabel } from '../i18n/useAdminCopy';
import AdminBackButton from './AdminBackButton';

const AdminBackToHistoryButton: FunctionComponent = () => {
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('history');
  return <AdminBackButton onClick={() => navigate('/admin/history')} label={backLabel} />;
};

export default AdminBackToHistoryButton;
