import { FunctionComponent, useCallback, useState } from 'react';



import { useNavigate } from 'react-router-dom';



import { useTranslation } from 'react-i18next';



import { Building2, Star } from 'lucide-react';

import OfferCompanyLogo from '../../../../admin/offres-stage/components/OfferCompanyLogo';
import { stageApi } from '../../../../shared/api/stageApi';

import { getInternshipOfferApplyPath } from '../../constants/routes';

import { STUDENT_CHAT_PATH } from '../../chat/constants/routes';



import type { InternshipOfferDetails } from '../../types';



import {



  DETAILS_OUTLINE_BUTTON,



  DETAILS_PRIMARY_BUTTON,



  DETAILS_SURFACE_CARD,



} from '../../constants/internshipOfferDetailsStyles';



import { DETAILS_TAG_PRIMARY } from '../../constants/internshipOfferDetailsStyles';



import { STUDENT_MATCH_SCORE } from '../../../design-system/studentSemanticStyles';



import { SafeBadge, SafeText } from '../../../../../design-system/safeContent';







interface InternshipOfferDetailsHeaderProps {



  offer: InternshipOfferDetails;



}







const InternshipOfferDetailsHeader: FunctionComponent<InternshipOfferDetailsHeaderProps> = ({



  offer,



}) => {



  const navigate = useNavigate();



  const { t } = useTranslation();

  const [startingChat, setStartingChat] = useState(false);



  const handleAskQuestion = useCallback(async () => {

    setStartingChat(true);

    try {

      const result = await stageApi.createChat(offer.id);

      navigate(`${STUDENT_CHAT_PATH}?conversation=${result.conversation_id}`);

    } catch {

      navigate(STUDENT_CHAT_PATH);

    } finally {

      setStartingChat(false);

    }

  }, [navigate, offer.id]);







  return (



    <header



      className={`${DETAILS_SURFACE_CARD} box-border w-full min-w-0 max-w-full overflow-hidden px-4 py-5 sm:px-6 sm:py-6`}



    >



      <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">



        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">

          <OfferCompanyLogo
            url={offer.companyLogoUrl}
            companyName={offer.company}
            size="detail"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-3">

          <h1 className="safe-card-title m-0 min-w-0 text-2xl font-semibold leading-8 tracking-tight text-[var(--admin-text)] sm:text-[28px] sm:leading-9">



            <SafeText as="span">{offer.title}</SafeText>



          </h1>







          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[14px] leading-5 text-[var(--admin-text-secondary)]">



            <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />



            <SafeText className="text-[inherit]">{offer.company}</SafeText>



            <span className="shrink-0 text-[var(--admin-text-muted)]">•</span>



            <SafeText className="text-[inherit]">{offer.location}</SafeText>



          </div>







          <div className="flex w-full min-w-0 flex-wrap gap-2">



            {offer.tags.map((tag) => (



              <SafeBadge key={tag} className={DETAILS_TAG_PRIMARY}>



                {tag}



              </SafeBadge>



            ))}



          </div>

          </div>

        </div>







        <div className={`${STUDENT_MATCH_SCORE} shrink-0 self-start`}>



          <div className="flex items-center gap-1.5">



            <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" aria-hidden />



            <span className="text-2xl font-bold tabular-nums leading-8 text-[var(--admin-text)]">



              {offer.matchPercent}%



            </span>



          </div>



          <span className="student-match-score__label">{t('student.internshipOffers.details.matchScore')}</span>



        </div>



      </div>







      <div className="mt-5 flex w-full min-w-0 flex-col gap-3 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-4">



        <button



          type="button"



          className={DETAILS_PRIMARY_BUTTON}



          onClick={() => navigate(getInternshipOfferApplyPath(offer.id))}



        >



          <span className="safe-button-label">{t('student.internshipOffers.details.applyNow')}</span>



        </button>



        <button

          type="button"

          className={DETAILS_OUTLINE_BUTTON}

          onClick={() => void handleAskQuestion()}

          disabled={startingChat}

        >



          <span className="safe-button-label">{t('student.internshipOffers.details.askQuestion')}</span>



        </button>



      </div>



    </header>



  );



};







export default InternshipOfferDetailsHeader;

