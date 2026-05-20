import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import AdminSelectField from '../../../ui/AdminSelectField';
import { fadeInUp } from '../../../dashboard/ui/animations';
import type { EngagementFilters } from '../../types/engagementDashboard';

interface Props {
  filters: EngagementFilters;
  onChange: (next: EngagementFilters) => void;
}

const EngagementFilterBar: FunctionComponent<Props> = ({ filters, onChange }) => {
  const { t } = useTranslation();
  const P = 'admin.announcementsModule.engagement.filters';

  const set = (patch: Partial<EngagementFilters>) => onChange({ ...filters, ...patch });

  return (
    <motion.section {...fadeInUp} className="admin-eng-filters" aria-label={t(`${P}.title`)}>
      <motion.div className="admin-eng-filters__head" {...fadeInUp}>
        <SlidersHorizontal className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
        <span className="admin-eng-filters__title">{t(`${P}.title`)}</span>
      </motion.div>
      <motion.div className="admin-eng-filters__grid" {...fadeInUp}>
        <AdminSelectField
          aria-label={t(`${P}.range`)}
          value={filters.range}
          onChange={(v) => set({ range: v as EngagementFilters['range'] })}
          options={(['7d', '14d', '30d', '90d'] as const).map((k) => ({
            value: k,
            label: t(`${P}.ranges.${k}`),
          }))}
        />
        <AdminSelectField
          aria-label={t(`${P}.program`)}
          value={filters.program}
          onChange={(v) => set({ program: v })}
          options={(['all', 'pge', 'lme', 'iba', 'master'] as const).map((k) => ({
            value: k,
            label: t(`${P}.programs.${k}`),
          }))}
        />
        <AdminSelectField
          aria-label={t(`${P}.type`)}
          value={filters.type}
          onChange={(v) => set({ type: v })}
          options={(['all', 'internship', 'general', 'urgent'] as const).map((k) => ({
            value: k,
            label: t(`${P}.types.${k}`),
          }))}
        />
        <AdminSelectField
          aria-label={t(`${P}.engagementType`)}
          value={filters.engagementType}
          onChange={(v) => set({ engagementType: v })}
          options={(['all', 'views', 'clicks', 'saves'] as const).map((k) => ({
            value: k,
            label: t(`${P}.engagementTypes.${k}`),
          }))}
        />
        <AdminSelectField
          aria-label={t(`${P}.audience`)}
          value={filters.audience}
          onChange={(v) => set({ audience: v })}
          options={(['all', 'targeted', 'custom'] as const).map((k) => ({
            value: k,
            label: t(`${P}.audiences.${k}`),
          }))}
        />
      </motion.div>
    </motion.section>
  );
};

export default EngagementFilterBar;
