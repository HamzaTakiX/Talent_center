import { FunctionComponent, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

import type { ReferenceStyle, ReportReference } from '../../types';

interface ReportReferencesManagerProps {
  open: boolean;
  onClose: () => void;
  references: ReportReference[];
  onAdd: (ref: Omit<ReportReference, 'id'>) => void;
  onRemove: (id: string) => void;
}

const STYLES: ReferenceStyle[] = ['apa', 'ieee', 'harvard'];

const ReportReferencesManager: FunctionComponent<ReportReferencesManagerProps> = ({
  open,
  onClose,
  references,
  onAdd,
  onRemove,
}) => {
  const { t } = useTranslation();
  const [style, setStyle] = useState<ReferenceStyle>('apa');
  const [authors, setAuthors] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [source, setSource] = useState('');

  const handleAdd = () => {
    if (!authors.trim() || !title.trim()) return;
    onAdd({ style, authors, title, year, source });
    setAuthors('');
    setTitle('');
    setYear('');
    setSource('');
  };

  const formatCitation = (ref: ReportReference) => {
    if (ref.style === 'apa') return `${ref.authors} (${ref.year}). ${ref.title}. ${ref.source}`;
    if (ref.style === 'ieee') return `[${ref.year}] ${ref.authors}, "${ref.title}," ${ref.source}.`;
    return `${ref.authors} (${ref.year}) ${ref.title}. ${ref.source}`;
  };

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
        >
          <motion.div
            className="student-report-overlay-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="student-report-overlay-header">
              <div>
                <h2 className="m-0 text-base font-bold">{t('student.reports.references.title')}</h2>
                <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">
                  {t('student.reports.references.subtitle')}
                </p>
              </div>
              <button type="button" className="student-report-action student-report-action--ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="student-report-overlay-body">
              <div className="mb-4 flex gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`student-report-action text-xs uppercase ${style === s ? 'student-report-action--primary' : ''}`}
                    onClick={() => setStyle(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="mb-4 space-y-2 rounded-xl border border-[var(--admin-border)] p-3">
                <input
                  type="text"
                  placeholder={t('student.reports.references.authors')}
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-brand)]"
                />
                <input
                  type="text"
                  placeholder={t('student.reports.references.titleField')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-brand)]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('student.reports.references.year')}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-24 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-brand)]"
                  />
                  <input
                    type="text"
                    placeholder={t('student.reports.references.source')}
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--admin-brand)]"
                  />
                </div>
                <button type="button" className="student-report-action student-report-action--primary w-full" onClick={handleAdd}>
                  <Plus className="h-4 w-4" aria-hidden />
                  {t('student.reports.references.add')}
                </button>
              </div>

              {references.map((ref) => (
                <div key={ref.id} className="student-report-ref-item">
                  <div className="mb-1 text-[10px] font-bold uppercase text-[var(--admin-brand)]">{ref.style}</div>
                  <p className="m-0">{formatCitation(ref)}</p>
                  <button
                    type="button"
                    className="student-report-comment-action mt-2"
                    onClick={() => onRemove(ref.id)}
                  >
                    <Trash2 className="mr-1 inline h-3 w-3" aria-hidden />
                    {t('student.reports.references.remove')}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportReferencesManager;
