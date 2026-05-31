import { FunctionComponent } from 'react';
import { Download, FileType, Printer, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportExportCenterProps {
  open: boolean;
  onClose: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onPrint: () => void;
  isExporting?: boolean;
}

const ReportExportCenter: FunctionComponent<ReportExportCenterProps> = ({
  open,
  onClose,
  onExportPdf,
  onExportDocx,
  onPrint,
  isExporting = false,
}) => {
  const { t } = useTranslation();

  const options = [
    { icon: Download, label: t('student.reports.export.pdf'), desc: t('student.reports.export.pdfDesc'), action: onExportPdf },
    { icon: FileType, label: t('student.reports.export.docx'), desc: t('student.reports.export.docxDesc'), action: onExportDocx },
    { icon: Printer, label: t('student.reports.export.print'), desc: t('student.reports.export.printDesc'), action: onPrint },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="student-report-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
                <h2 className="m-0 text-base font-bold">{t('student.reports.export.title')}</h2>
                <p className="m-0 mt-0.5 text-xs text-[var(--admin-text-muted)]">{t('student.reports.export.subtitle')}</p>
              </div>
              <button type="button" className="student-report-action student-report-action--ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="student-report-overlay-body space-y-3">
              {options.map(({ icon: Icon, label, desc, action }) => (
                <button
                  key={label}
                  type="button"
                  className="student-report-ai-action"
                  disabled={isExporting}
                  onClick={() => {
                    action();
                    onClose();
                  }}
                >
                  <Icon className="h-5 w-5 shrink-0 text-[var(--admin-brand)]" aria-hidden />
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-[var(--admin-text-muted)]">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportExportCenter;
