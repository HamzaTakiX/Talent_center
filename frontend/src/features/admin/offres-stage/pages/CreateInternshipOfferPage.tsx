import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminBackLabel } from '../../i18n/useAdminCopy';
import AdminLayout from '../../components/AdminLayout';
import CreateInternshipOfferForm from '../components/CreateInternshipOfferForm';

const CreateInternshipOfferPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const backLabel = useAdminBackLabel('offers');
  const goBack = () => navigate('/admin/internship-offers');

  return (
    <AdminLayout>
      <div className="flex w-full min-w-0 flex-col gap-5 pb-2 font-inter">
        <button
          type="button"
          onClick={goBack}
          className="admin-btn-secondary inline-flex h-9 w-fit shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          <span className="leading-5">{backLabel}</span>
        </button>

        <CreateInternshipOfferForm onCancel={goBack} onPublish={goBack} />
      </div>
    </AdminLayout>
  );
};

export default CreateInternshipOfferPage;
