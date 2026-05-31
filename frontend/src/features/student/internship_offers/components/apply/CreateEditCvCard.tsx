import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../../constants/routes';
import {
  APPLY_ICON_BOX_PURPLE,
  APPLY_PURPLE_BUTTON,
  APPLY_SURFACE_CARD,
} from '../../constants/internshipApplyStyles';

interface CreateEditCvCardProps {
  offerTitle: string;
  features: string[];
}

const CreateEditCvCard: FunctionComponent<CreateEditCvCardProps> = ({ offerTitle, features }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <article
      className={`${APPLY_SURFACE_CARD} box-border flex h-full w-full min-w-0 max-w-full flex-col px-4 py-5 sm:px-6 sm:py-6`}
    >
      <div className="mb-4 flex min-w-0 items-start gap-3">
        <span className={APPLY_ICON_BOX_PURPLE}>
          <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-base font-semibold leading-6 text-[var(--admin-text)]">
            {t('student.internshipOffers.apply.createEditCv')}
          </h2>
          <p className="m-0 mt-1 text-sm leading-5 text-[#6a7282]">
            {t('student.internshipOffers.apply.createEditDesc')}
          </p>
        </div>
      </div>

      <ul className="m-0 mb-6 flex list-none flex-col gap-2.5 p-0">
        {features.map((feature) => (
          <li key={feature} className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--admin-text-secondary)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#22c55e]" strokeWidth={2} aria-hidden />
            <span className="min-w-0 break-words">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`${APPLY_PURPLE_BUTTON} mt-auto`}
        onClick={() =>
          navigate('/cv-editor', {
            state: { returnTo: STUDENT_INTERNSHIP_OFFERS_PATH },
          })
        }
        aria-label={`${t('student.internshipOffers.apply.openCvEditor')} — ${offerTitle}`}
      >
        {t('student.internshipOffers.apply.openCvEditor')}
      </button>
    </article>
  );
};

export default CreateEditCvCard;
