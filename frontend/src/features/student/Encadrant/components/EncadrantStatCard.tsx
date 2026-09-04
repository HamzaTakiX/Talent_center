import { CSSProperties, FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { EncadrantStatItem } from '../types';
import { encadrantStatAccentMap, encadrantStatIconMap } from '../data/encadrantMock';

interface EncadrantStatCardProps {
  stat: EncadrantStatItem;
}

const STAT_BADGE_KEYS: Record<EncadrantStatItem['iconKey'], string> = {
  tasks: 'student.encadrant.stats.badges.tasks',
  meetings: 'student.encadrant.stats.badges.meetings',
  report: 'student.encadrant.stats.badges.report',
  deadline: 'student.encadrant.stats.badges.deadline',
};

const STAT_LABEL_KEYS: Record<EncadrantStatItem['iconKey'], string> = {
  tasks: 'student.encadrant.stats.tasks',
  meetings: 'student.encadrant.stats.meetings',
  report: 'student.encadrant.stats.report',
  deadline: 'student.encadrant.stats.deadline',
};

const EncadrantStatCard: FunctionComponent<EncadrantStatCardProps> = ({ stat }) => {
  const { t } = useTranslation();
  const Icon = encadrantStatIconMap[stat.iconKey];
  const colors = encadrantStatAccentMap[stat.iconKey];
  const label = t(STAT_LABEL_KEYS[stat.iconKey], { defaultValue: stat.label });
  const badge = t(STAT_BADGE_KEYS[stat.iconKey], {
    defaultValue:
      stat.iconKey === 'tasks'
        ? 'Pending'
        : stat.iconKey === 'meetings'
          ? 'Upcoming'
          : stat.iconKey === 'report'
            ? 'Progress'
            : 'Remaining',
  });

  const piePercent =
    stat.iconKey === 'report'
      ? Math.min(100, Math.max(0, Number.parseInt(stat.value, 10) || 0))
      : undefined;

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
        <span className="admin-students-stat-card__badge">{badge}</span>
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

export default EncadrantStatCard;
