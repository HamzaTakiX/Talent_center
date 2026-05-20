import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../ui';
import PendingValidationProofTable from '../components/PendingValidationProofTable';

const PaymentValidationQueuePage: FunctionComponent = () => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/srf')} backTo="srf">
      <PendingValidationProofTable />
    </AdminListPageShell>
  );
};

export default PaymentValidationQueuePage;
