import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import {
  CV_ANALYSIS_CANCEL_BUTTON,
  CV_ANALYSIS_CONFIRM_BUTTON,
  CV_ANALYSIS_EDIT_BUTTON,
} from '../../constants/cvAnalysisStyles';
import { getInternshipOfferApplyPath } from '../../constants/routes';

interface CvAnalysisActionBarProps {
  offerId: string;
}

const CvAnalysisActionBar: FunctionComponent<CvAnalysisActionBarProps> = ({ offerId }) => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full min-w-0 flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-4">
      <button
        type="button"
        className={CV_ANALYSIS_CANCEL_BUTTON}
        onClick={() => navigate(getInternshipOfferApplyPath(offerId))}
      >
        Cancel
      </button>
      <button
        type="button"
        className={CV_ANALYSIS_EDIT_BUTTON}
        onClick={() => navigate('/cv-editor')}
      >
        Edit My CV
      </button>
      <button
        type="button"
        className={CV_ANALYSIS_CONFIRM_BUTTON}
        onClick={() => console.log('Confirm application', offerId)}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        Confirm &amp; Apply
      </button>
    </div>
  );
};

export default CvAnalysisActionBar;
