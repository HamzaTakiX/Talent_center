import { FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, Eye } from 'lucide-react';
import { getEncadrantReportViewPath } from '../constants/routes';
import {
  REPORT_DETAIL_ACTION_BTN,
  REPORT_DETAIL_ACTIONS,
  REPORT_DETAIL_VALIDATE_BTN,
} from '../constants/reportDetailLayout';
import type { ReportDetailRow } from '../types';

interface ReportsDetailRowActionsProps {
  studentId: string;
  row: ReportDetailRow;
}

const ReportsDetailRowActions: FunctionComponent<ReportsDetailRowActionsProps> = ({
  studentId,
  row,
}) => {
  const navigate = useNavigate();

  return (
  <div className={REPORT_DETAIL_ACTIONS}>
    <button
      type="button"
      className={REPORT_DETAIL_ACTION_BTN}
      onClick={() => navigate(getEncadrantReportViewPath(studentId, row.id))}
    >
      <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      View
    </button>
    <button type="button" className={REPORT_DETAIL_ACTION_BTN}>
      <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      Download
    </button>
    {row.showValidate ? (
      <button type="button" className={REPORT_DETAIL_VALIDATE_BTN}>
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
        Validate
      </button>
    ) : null}
  </div>
  );
};

export default ReportsDetailRowActions;
