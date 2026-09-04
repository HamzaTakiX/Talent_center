import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { STUDENT_ICON_CHIP_DANGER } from '../../design-system/studentSemanticStyles';
import { STUDENT_SECONDARY_BUTTON } from '../constants/studentDashboardStyles';

interface StudentDashboardLoadErrorProps {
  message: string;
  onRetry: () => void;
}

const StudentDashboardLoadError: FunctionComponent<StudentDashboardLoadErrorProps> = ({
  message,
  onRetry,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      role="alert"
      className="student-dashboard-load-error"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={`student-dashboard-load-error__icon ${STUDENT_ICON_CHIP_DANGER}`} aria-hidden>
        <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
      </span>

      <div className="student-dashboard-load-error__body">
        <p className="student-dashboard-load-error__title">
          {t('student.dashboard.errors.loadTitle')}
        </p>
        <p className="student-dashboard-load-error__message">{message}</p>
      </div>

      <button
        type="button"
        className={`student-dashboard-load-error__retry ${STUDENT_SECONDARY_BUTTON} admin-btn--sm`}
        onClick={() => void onRetry()}
      >
        <RefreshCw className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        {t('student.dashboard.errors.retry')}
      </button>
    </motion.div>
  );
};

export default StudentDashboardLoadError;
