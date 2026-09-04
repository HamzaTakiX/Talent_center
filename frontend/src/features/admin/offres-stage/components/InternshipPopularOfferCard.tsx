import { CSSProperties, FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Award, Eye, MapPin, Users } from 'lucide-react';
import { easePremium } from '../../dashboard/ui/animations';
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';
import OfferCompanyLogo from './OfferCompanyLogo';
import type { PopularOfferBrief } from '../types';

interface InternshipPopularOfferCardProps {
  label: string;
  labelKey?: string;
  offer: PopularOfferBrief;
  index?: number;
  compact?: boolean;
}

const InternshipPopularOfferCard: FunctionComponent<InternshipPopularOfferCardProps> = ({
  label,
  labelKey,
  offer,
  index = 0,
  compact = false,
}) => {
  const { t } = useTranslation();
  const translateLabel = useTranslateAdminLabel();
  const title = translateLabel(label, labelKey);
  const accent = '#06b6d4';
  const accentBg = 'rgba(6, 182, 212, 0.16)';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: easePremium }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={[
        'admin-students-stat-card admin-offers-popular-stat-card',
        compact ? 'admin-students-stat-card--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--student-stat-accent': accent,
          '--student-stat-accent-bg': accentBg,
        } as CSSProperties
      }
    >
      <div className="admin-students-stat-card__body">
        <div className="admin-students-stat-card__head">
          <span className="admin-students-stat-card__icon">
            {offer.companyLogoUrl ? (
              <OfferCompanyLogo url={offer.companyLogoUrl} companyName={offer.companyName} size="table" />
            ) : (
              <Award className={compact ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={1.8} aria-hidden />
            )}
          </span>
          <p className="admin-students-stat-card__title">{title}</p>
        </div>

        <p className="admin-students-stat-card__value admin-offers-popular-stat-card__title">{offer.title}</p>
        <span className="admin-students-stat-card__badge">{offer.companyName}</span>

        <div className="admin-offers-popular-stat-card__meta">
          <span>
            <Eye className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
            {offer.viewCount} {t('admin.kpi.offers.popularOffer.views')}
          </span>
          <span>
            <Users className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
            {offer.applicationCount} {t('admin.tables.columns.applicants')}
          </span>
          {offer.locationCity ? (
            <span>
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
              {offer.locationCity}
            </span>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
};

export default InternshipPopularOfferCard;
