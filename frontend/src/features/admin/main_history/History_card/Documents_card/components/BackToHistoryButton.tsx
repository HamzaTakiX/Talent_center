import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackToHistoryButton: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/admin/history')}
      className="admin-btn-secondary inline-flex h-9 items-center gap-2 px-4 text-sm font-medium"
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      <span className="leading-5">Back to History</span>
    </button>
  );
};

export default BackToHistoryButton;
