import { CSSProperties, FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import type { StudentStatItem } from '../data/studentDashboardMock';
import { studentStatIconMap } from '../data/studentDashboardMock';
import { scaleTap, staggerItem } from '../../../admin/dashboard/ui/animations';

const statAccentMap: Record<
  StudentStatItem['iconKey'],
  { tone: string; accent: string; bg: string }
> = {
  sent: { tone: 'blue', accent: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  pending: { tone: 'amber', accent: '#d97706', bg: 'rgba(217, 119, 6, 0.1)' },
  interviews: { tone: 'violet', accent: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)' },
  accepted: { tone: 'emerald', accent: '#059669', bg: 'rgba(5, 150, 105, 0.1)' },
  rejected: { tone: 'rose', accent: '#e11d48', bg: 'rgba(225, 29, 72, 0.1)' },
};

interface StudentDashboardStatCardProps {
  stat: StudentStatItem;
  index?: number;
  onClick?: () => void;
}

const StudentDashboardStatCard: FunctionComponent<StudentDashboardStatCardProps> = ({
  stat,
  index = 0,
  onClick,
}) => {
  const { t } = useTranslation();
  const Icon = studentStatIconMap[stat.iconKey];
  const { tone, accent, bg } = statAccentMap[stat.iconKey];
  const toneStyle = { '--stat-accent': accent, '--stat-accent-bg': bg } as CSSProperties;

  return (
    <motion.button
      type="button"
      variants={staggerItem}
      custom={index}
      onClick={onClick}
      data-tone={tone}
      style={toneStyle}
      whileTap={scaleTap.whileTap}
      className="admin-stat-cell group relative flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors sm:px-4 sm:py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--stat-accent)]"
    >
      <span
        className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full opacity-80"
        style={{ background: accent }}
        aria-hidden
      />

      <span className="admin-stat-icon-wrap flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105">
        <Icon className="h-4 w-4" strokeWidth={1.75} style={{ color: accent }} aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-[var(--admin-text-secondary)] sm:text-xs">
          {t(`student.dashboard.stats.${stat.labelKey}`)}
        </p>
        <p
          className="mt-0.5 text-lg font-semibold tabular-nums leading-none tracking-tight sm:text-xl"
          style={{ color: accent }}
        >
          {stat.value}
        </p>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
        style={{ color: accent }}
        strokeWidth={2}
        aria-hidden
      />
    </motion.button>
  );
};

export default StudentDashboardStatCard;
