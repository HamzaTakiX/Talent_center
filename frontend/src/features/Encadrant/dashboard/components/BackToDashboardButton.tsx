import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ENCADRANT_PATH } from '../constants/routes';
import { STUDENT_DETAIL_BACK_BUTTON } from '../constants/studentDetailLayout';

const BackToDashboardButton: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(ENCADRANT_PATH)}
      className={STUDENT_DETAIL_BACK_BUTTON}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      <span className="leading-5">Back to Dashboard</span>
    </button>
  );
};

export default BackToDashboardButton;
