import { FunctionComponent } from 'react';

import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { FileText } from 'lucide-react';

import { getInternshipOfferCvAnalysisPath } from '../../constants/routes';

import {

  APPLY_BLUE_BUTTON,

  APPLY_SURFACE_CARD,

  APPLY_ICON_BOX_BLUE,

} from '../../constants/internshipApplyStyles';



interface UseExistingCvCardProps {

  offerId: string;

  onApply?: () => void;

  applying?: boolean;

}



const UseExistingCvCard: FunctionComponent<UseExistingCvCardProps> = ({

  offerId,

  onApply,

  applying = false,

}) => {

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



      <div className="mt-auto flex flex-col gap-2 sm:flex-row">

        {onApply && (

          <button

            type="button"

            className={`${APPLY_BLUE_BUTTON} flex-1`}

            onClick={onApply}

            disabled={applying}

          >

            {applying ? 'Envoi en cours…' : t('student.internshipOffers.details.applyNow')}

          </button>

        )}

        <button

          type="button"

          className={`${APPLY_BLUE_BUTTON} flex-1`}

          onClick={() => navigate(getInternshipOfferCvAnalysisPath(offerId))}

        >

          {t('student.internshipOffers.apply.analyzeCv')}

        </button>

      </div>

    </article>

  );

};



export default UseExistingCvCard;


