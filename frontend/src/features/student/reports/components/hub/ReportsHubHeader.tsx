import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { studentReportEditorPath } from '../../constants/routes';

const ReportsHubHeader: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.header
      className="student-reports-hub-header"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-[var(--admin-brand)]">
            <Sparkles className="h-4 w-4" aria-hidden />
            {t('student.reports.hub.badge')}
          </div>
          <h1 className="student-reports-hub-title">{t('student.reports.hub.title')}</h1>
          <p className="m-0 mt-2 max-w-xl text-sm text-[var(--admin-text-muted)]">
            {t('student.reports.hub.subtitle')}
          </p>
        </div>
        <Link
          to={studentReportEditorPath('rpt-main-2026')}
          className="student-report-action student-report-action--primary inline-flex shrink-0 self-start"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t('student.reports.hub.newReport')}
        </Link>
      </div>
    </motion.header>
  );
};

export default ReportsHubHeader;
