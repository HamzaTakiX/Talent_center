import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { SmartAssignmentSeverity } from '../../../../api/types';

interface SmartAssignmentSeverityBadgeProps {
  severity: SmartAssignmentSeverity;
}

const severityClass: Record<SmartAssignmentSeverity, string> = {
  critical: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  info: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
};

const SmartAssignmentSeverityBadge: FunctionComponent<SmartAssignmentSeverityBadgeProps> = ({
  severity,
}) => {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${severityClass[severity]}`}
    >
      {t(`admin.smartAssignment.validation.severity.${severity}`)}
    </span>
  );
};

export default SmartAssignmentSeverityBadge;
