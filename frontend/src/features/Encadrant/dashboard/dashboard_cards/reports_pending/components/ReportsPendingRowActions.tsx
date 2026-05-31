import { FunctionComponent } from 'react';
import { Check, Eye, Send } from 'lucide-react';
import {
  REPORTS_PENDING_ACTIONS_CELL,
  REPORTS_PENDING_PRIMARY_ACTION,
  REPORTS_PENDING_SECONDARY_ACTION,
} from '../constants/reportsPendingLayout';

const ReportsPendingRowActions: FunctionComponent = () => (
  <div className={REPORTS_PENDING_ACTIONS_CELL}>
    <button type="button" className={REPORTS_PENDING_SECONDARY_ACTION}>
      <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      View
    </button>
    <button type="button" className={REPORTS_PENDING_SECONDARY_ACTION}>
      <Check className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      Validate
    </button>
    <button type="button" className={REPORTS_PENDING_PRIMARY_ACTION}>
      <Send className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      Remind
    </button>
  </div>
);

export default ReportsPendingRowActions;
