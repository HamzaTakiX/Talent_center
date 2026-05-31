import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, FileText } from 'lucide-react';
import { getInternshipOfferCvAnalysisPath } from '../../constants/routes';
import type { StudentCvFileMock } from '../../data/internshipApplyMock';
import {
  APPLY_BLUE_BUTTON,
  APPLY_CV_PREVIEW_CARD,
  APPLY_ICON_BOX_BLUE,
  APPLY_SURFACE_CARD,
} from '../../constants/internshipApplyStyles';

interface UseExistingCvCardProps {
  offerId: string;
  cvFile: StudentCvFileMock;
}

const UseExistingCvCard: FunctionComponent<UseExistingCvCardProps> = ({ offerId, cvFile }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <article
      className={`${APPLY_SURFACE_CARD} box-border flex h-full w-full min-w-0 max-w-full flex-col px-4 py-5 sm:px-6 sm:py-6`}
    >
      <div className="mb-4 flex min-w-0 items-start gap-3">
        <span className={APPLY_ICON_BOX_BLUE}>
          <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)]">
            {t('student.internshipOffers.apply.useExistingCv')}
          </h2>
          <p className="m-0 mt-1 text-sm leading-5 text-[#6a7282]">
            {t('student.internshipOffers.apply.useExistingDesc')}
          </p>
        </div>
      </div>

      <div className={`${APPLY_CV_PREVIEW_CARD} mb-5`}>
        <FileText className="h-5 w-5 shrink-0 text-[#6a7282]" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-sm font-semibold leading-5 text-[var(--admin-text)]">{cvFile.fileName}</p>
          <p className="m-0 mt-0.5 text-xs leading-4 text-[#6a7282]">
            {t('student.internshipOffers.apply.lastUpdated')}: {cvFile.lastUpdated}
          </p>
        </div>
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#22c55e]" strokeWidth={2} aria-hidden />
      </div>

      <button
        type="button"
        className={`${APPLY_BLUE_BUTTON} mt-auto`}
        onClick={() => navigate(getInternshipOfferCvAnalysisPath(offerId))}
      >
        {t('student.internshipOffers.apply.analyzeCv')}
      </button>
    </article>
  );
};

export default UseExistingCvCard;
