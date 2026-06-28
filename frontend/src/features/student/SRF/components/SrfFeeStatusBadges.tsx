import { FunctionComponent } from 'react';

import { useTranslation } from 'react-i18next';

import { CircleCheck, Clock, AlertTriangle } from 'lucide-react';

import type { SrfFeeRowStatus } from '../types';

import {

  SRF_BADGE_WITH_ICON,

  SRF_FEE_BADGE_PAID,

  SRF_FEE_BADGE_UNPAID,

  SRF_FEE_BADGE_VALIDATED,

  SRF_FEE_BADGE_PENDING,

  SRF_FEE_BADGE_PARTIAL,

  SRF_FEE_BADGE_LATE,

} from '../constants/srfBadgeStyles';



interface SrfFeeStatusBadgesProps {

  status: SrfFeeRowStatus;

}



const SrfFeeStatusBadges: FunctionComponent<SrfFeeStatusBadgesProps> = ({ status }) => {

  const { t } = useTranslation();



  if (status === 'paid') {

    return (

      <div className="flex flex-wrap items-center gap-1.5">

        <span className={`${SRF_BADGE_WITH_ICON} ${SRF_FEE_BADGE_PAID}`}>

          <CircleCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />

          {t('student.srf.status.paid')}

        </span>

        <span className={`${SRF_BADGE_WITH_ICON} ${SRF_FEE_BADGE_VALIDATED}`}>

          <CircleCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />

          {t('student.srf.status.validated')}

        </span>

      </div>

    );

  }



  if (status === 'pending') {

    return (

      <span className={`${SRF_BADGE_WITH_ICON} ${SRF_FEE_BADGE_PENDING}`}>

        <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />

        {t('student.srf.status.pending')}

      </span>

    );

  }



  if (status === 'partial') {

    return (

      <span className={`${SRF_BADGE_WITH_ICON} ${SRF_FEE_BADGE_PARTIAL}`}>

        <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />

        {t('student.srf.status.partial')}

      </span>

    );

  }



  if (status === 'late') {

    return (

      <span className={`${SRF_BADGE_WITH_ICON} ${SRF_FEE_BADGE_LATE}`}>

        <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />

        {t('student.srf.status.late')}

      </span>

    );

  }



  return (

    <span className={`${SRF_BADGE_WITH_ICON} ${SRF_FEE_BADGE_UNPAID}`}>

      <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />

      {t('student.srf.status.toPay')}

    </span>

  );

};



export default SrfFeeStatusBadges;

