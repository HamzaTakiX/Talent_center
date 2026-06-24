import { FunctionComponent } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { easePremium, fadeInUp } from '../../../admin/dashboard/ui/animations';

import RecommendedOffersEmptyIllustration from './RecommendedOffersEmptyIllustration';

const RecommendedOffersEmptyState: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      {...fadeInUp}
      transition={{ duration: 0.45, ease: easePremium }}
      className="student-recommended-empty w-full min-w-0 max-w-full"
      role="status"
      aria-live="polite"
    >
      <RecommendedOffersEmptyIllustration />

      <motion.p
        className="student-recommended-empty__title"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easePremium, delay: 0.12 }}
      >
        {t('student.internshipOffers.noRecommendationsTitle')}
      </motion.p>
    </motion.div>
  );
};

export default RecommendedOffersEmptyState;
