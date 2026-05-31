import { FunctionComponent } from 'react';
import { GitCompare, RotateCcw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

import type { ReportVersion } from '../../types';

interface ReportVersionHistoryPanelProps {
  open: boolean;
  onClose: () => void;
  versions: ReportVersion[];
  onRestore: (versionId: string) => void;
  onCompare?: (versionId: string) => void;
}

const ReportVersionHistoryPanel: FunctionComponent<ReportVersionHistoryPanelProps> = ({
  open,
  onClose,
  versions,
  onRestore,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="student-report-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal
          aria-label={t('student.reports.versions.title')}
        >
          <motion.div
            className="student-report-overlay-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="student-report-overlay-header">
              <div>
                <h2 className="m-0 text-base font-bold text-[var(--admin-text)]">
                  {t('student.reports.versions.title')}
                </h2>
                <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">
                  {t('student.reports.versions.subtitle')}
                </p>
              </div>
              <button type="button" className="student-report-action student-report-action--ghost" onClick={onClose} aria-label={t('student.reports.versions.close')}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="student-report-overlay-body">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="mb-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm text-[var(--admin-text)]">{v.label}</div>
                      <div className="mt-0.5 text-xs text-[var(--admin-text-muted)]">
                        {new Date(v.createdAt).toLocaleString()} · {v.wordCount} {t('student.reports.analytics.words').toLowerCase()}
                      </div>
                    </div>
                    {v.isCurrent && (
                      <span className="rounded-full bg-[var(--admin-brand-muted)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--admin-brand)]">
                        {t('student.reports.versions.current')}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {!v.isCurrent && (
                      <button
                        type="button"
                        className="student-report-action text-xs"
                        onClick={() => onRestore(v.id)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                        {t('student.reports.versions.restore')}
                      </button>
                    )}
                    <button type="button" className="student-report-action text-xs" disabled>
                      <GitCompare className="h-3.5 w-3.5" aria-hidden />
                      {t('student.reports.versions.compare')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportVersionHistoryPanel;
