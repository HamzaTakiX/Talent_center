import { CSSProperties, FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Eye, MapPin, Users } from 'lucide-react';
import { scaleTap, staggerItem } from '../../dashboard/ui/animations';
import { useTranslateAdminLabel } from '../../i18n/useTranslateAdminLabel';
import OfferCompanyLogo from './OfferCompanyLogo';
import { formatOfferDetailDateOnly } from '../utils/offerDetailViewModel';
import type { PopularOfferBrief } from '../types';

interface InternshipPopularOfferCardProps {
  label: string;
  labelKey?: string;
  offer: PopularOfferBrief;
  index?: number;
}

const InternshipPopularOfferCard: FunctionComponent<InternshipPopularOfferCardProps> = ({
  label,
  labelKey,
  offer,
  index = 0,
}) => {
  const { t } = useTranslation();
  const translateLabel = useTranslateAdminLabel();
  const navigate = useNavigate();
  const accent = '#06b6d4';
  const accentBg = 'rgba(6, 182, 212, 0.12)';
  const toneStyle = {
    '--stat-accent': accent,
    '--stat-accent-bg': accentBg,
  } as CSSProperties;

  const deadlineLabel = offer.applicationDeadline
    ? formatOfferDetailDateOnly(offer.applicationDeadline)
    : null;

  return (
    <motion.button
      type="button"
      variants={staggerItem}
      custom={index}
      onClick={() => navigate(`/admin/internship-offers/${offer.uuid}`)}
      style={toneStyle}
      whileTap={scaleTap.whileTap}
      className="admin-kpi-cell admin-kpi-cell--popular-offer group focus-visible:outline-none"
      tabIndex={0}
    >
      <span
        className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full opacity-80"
        style={{ background: accent }}
        aria-hidden
      />
      <OfferCompanyLogo
        url={offer.companyLogoUrl}
        companyName={offer.companyName}
        size="kpi"
      />
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="admin-kpi-label admin-kpi-label--compact block truncate">
          {translateLabel(label, labelKey)}
        </span>
        <span className="admin-kpi-popular-offer__title mt-0.5 block truncate">
          {offer.title}
        </span>
        <span className="admin-kpi-popular-offer__company mt-0.5 block truncate">
          {offer.companyName}
        </span>
        <span className="admin-kpi-popular-offer__meta mt-1">
          <span className="admin-kpi-popular-offer__meta-item">
            <Eye className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>
              {offer.viewCount} {t('admin.kpi.offers.popularOffer.views')}
            </span>
          </span>
          <span className="admin-kpi-popular-offer__meta-item">
            <Users className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>
              {offer.applicationCount} {t('admin.tables.columns.applicants')}
            </span>
          </span>
          {offer.locationCity ? (
            <span className="admin-kpi-popular-offer__meta-item">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="truncate">{offer.locationCity}</span>
            </span>
          ) : null}
          {deadlineLabel ? (
            <span className="admin-kpi-popular-offer__meta-item">
              <Calendar className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
              <span>{deadlineLabel}</span>
            </span>
          ) : null}
        </span>
      </span>
      <ChevronRight
        className="h-3.5 w-3.5 shrink-0 self-center text-[var(--admin-text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
        strokeWidth={2}
        aria-hidden
      />
    </motion.button>
  );
};

export default InternshipPopularOfferCard;
