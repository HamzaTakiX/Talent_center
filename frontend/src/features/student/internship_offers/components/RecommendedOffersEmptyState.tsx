import { FunctionComponent } from 'react';

import { useTranslation } from 'react-i18next';

import { Target } from 'lucide-react';

import AdminSearchEmptyState from '../../../admin/ui/AdminSearchEmptyState';



const RecommendedOffersEmptyState: FunctionComponent = () => {

  const { t } = useTranslation();



  return (

    <div className="student-recommended-empty w-full min-w-0 max-w-full">

      <AdminSearchEmptyState

        title={t('student.internshipOffers.noRecommendationsTitle')}

        description={t('student.internshipOffers.noRecommendationsDesc')}

        icon={<Target className="h-6 w-6" strokeWidth={1.75} aria-hidden />}

        variant="inline"

      />

    </div>

  );

};



export default RecommendedOffersEmptyState;

