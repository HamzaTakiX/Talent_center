import { FunctionComponent } from 'react';
import { Check, Eye, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  REPORTS_PENDING_ACTIONS_CELL,
  REPORTS_PENDING_PRIMARY_ACTION,
  REPORTS_PENDING_SECONDARY_ACTION,
} from '../constants/reportsPendingLayout';

const ReportsPendingRowActions: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className={REPORTS_PENDING_ACTIONS_CELL}>
      <button type="button" className={REPORTS_PENDING_SECONDARY_ACTION}>
        <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        {t('encadrant.common.view')}
      </button>
      <button type="button" className={REPORTS_PENDING_SECONDARY_ACTION}>
        <Check className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        {t('encadrant.common.validate')}
      </button>
      <button type="button" className={REPORTS_PENDING_PRIMARY_ACTION}>
        <Send className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        {t('encadrant.dashboard.pendingReports.remind')}
      </button>
    </div>
  );
};

export default ReportsPendingRowActions;
