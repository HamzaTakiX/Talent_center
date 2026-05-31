import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { InternshipOfferDetails } from '../../types';
import { APPLY_SURFACE_CARD } from '../../constants/internshipApplyStyles';

interface ApplyInternshipHeaderProps {
  offer: InternshipOfferDetails;
}

const ApplyInternshipHeader: FunctionComponent<ApplyInternshipHeaderProps> = ({ offer }) => {
  const { t } = useTranslation();

  return (
    <header
      className={`${APPLY_SURFACE_CARD} box-border w-full min-w-0 max-w-full px-4 py-5 sm:px-6 sm:py-6`}
    >
      <h1 className="m-0 min-w-0 break-words text-2xl font-semibold leading-8 tracking-tight text-[var(--admin-text)] sm:text-[28px] sm:leading-9">
        {t('student.internshipOffers.apply.title')}
      </h1>
      <p className="m-0 mt-2 min-w-0 break-words text-sm leading-6 text-[var(--admin-text-secondary)] sm:text-base">
        {offer.title}
        <span className="text-[#99a1af]"> · </span>
        {offer.company}
      </p>
    </header>
  );
};

export default ApplyInternshipHeader;
