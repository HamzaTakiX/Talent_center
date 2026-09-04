import { CSSProperties, FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { InternshipOffersStatItem } from '../types';
import {
  internshipOffersStatAccentMap,
  internshipOffersStatIconMap,
} from '../constants/internshipOffersStatConfig';

interface InternshipOffersStatCardProps {
  stat: InternshipOffersStatItem;
  piePercent?: number;
  badge?: string;
}

/** Carte KPI style admin encadrants / students (glass + pie optionnel). */
const InternshipOffersStatCard: FunctionComponent<InternshipOffersStatCardProps> = ({
  stat,
  piePercent,
  badge,
}) => {
  const { t } = useTranslation();
  const Icon = internshipOffersStatIconMap[stat.iconKey];
  const colors = internshipOffersStatAccentMap[stat.iconKey];
  const label = t(`student.internshipOffers.stats.${stat.iconKey}`, {
    defaultValue: stat.label,
  });
  const badgeLabel =
    badge ??
    t('student.internshipOffers.stats.badges.summary', {
      defaultValue: 'Aperçu',
    });

  return (
    <article
      className={[
        'admin-students-stat-card',
        'admin-students-stat-card--compact',
        piePercent != null ? 'admin-students-stat-card--rate' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--student-stat-accent': colors.accent,
          '--student-stat-accent-bg': colors.accentBg,
        } as CSSProperties
      }
    >
      <div className="admin-students-stat-card__body">
        <div className="admin-students-stat-card__head">
          <span className="admin-students-stat-card__icon" aria-hidden>
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <p className="admin-students-stat-card__title">{label}</p>
        </div>
        <p className="admin-students-stat-card__value">{stat.value}</p>
        <span className="admin-students-stat-card__badge">{badgeLabel}</span>
      </div>
      {piePercent != null ? (
        <div
          className="admin-students-stat-card__pie"
          style={{ '--student-stat-pie': piePercent } as CSSProperties}
          role="img"
          aria-label={`${label} ${piePercent}%`}
        >
          <span className="admin-students-stat-card__pie-inner">{piePercent}%</span>
        </div>
      ) : null}
    </article>
  );
};

export default InternshipOffersStatCard;
