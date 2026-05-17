import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBackButton from '../../../../ui/AdminBackButton';

const BackToDashboardButton: FunctionComponent = () => {
  const navigate = useNavigate();
  return <AdminBackButton onClick={() => navigate('/admin/dashboard')} />;
};

export default BackToDashboardButton;
