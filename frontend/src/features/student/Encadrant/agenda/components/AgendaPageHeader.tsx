import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../../admin/dashboard/ui/animations';
import { agendaExportActions } from '../data/agendaPlatformMock';
import { AGENDA_GHOST_BTN } from '../constants/agendaLayout';
import {
  FileSpreadsheet,
  FileText,
  CalendarPlus,
  Download,
} from 'lucide-react';

const exportIcons = {
  pdf: FileText,
  excel: FileSpreadsheet,
  ics: Download,
  google: CalendarPlus,
  outlook: CalendarPlus,
} as const;

const AgendaPageHeader: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easePremium }}
      className="student-agenda-hero student-agenda-glass"
    >
      <span
        className="student-agenda-hero__glow -right-12 -top-12 h-40 w-40"
        style={{ background: 'var(--admin-brand-muted)' }}
        aria-hidden
      />
      <span
        className="student-agenda-hero__glow bottom-0 left-1/4 h-28 w-28"
        style={{ background: 'var(--admin-mesh-2)' }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-brand-muted)] px-3 py-1 text-xs font-semibold text-[var(--admin-brand)]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {t('student.encadrant.agenda.platform.badge')}
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] text-[var(--admin-brand)]">
              <CalendarRange className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <h1 className="m-0 text-xl font-bold tracking-tight text-[var(--admin-text)] sm:text-2xl">
                {t('student.encadrant.agenda.platform.title')}
              </h1>
              <p className="m-0 mt-1 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-secondary)]">
                {t('student.encadrant.agenda.platform.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="student-agenda-export-bar shrink-0">
          {agendaExportActions.map((action) => {
            const Icon = exportIcons[action.iconKey];
            return (
              <button key={action.id} type="button" className={AGENDA_GHOST_BTN}>
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                <span className="hidden sm:inline">{t(action.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.header>
  );
};

export default AgendaPageHeader;
