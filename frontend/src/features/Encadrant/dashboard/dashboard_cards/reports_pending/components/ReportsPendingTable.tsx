import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  REPORTS_PENDING_TABLE,
  REPORTS_PENDING_TABLE_HEAD,
  REPORTS_PENDING_TABLE_WRAP,
  REPORTS_PENDING_TD,
  REPORTS_PENDING_TH,
  REPORTS_PENDING_ROW,
} from '../constants/reportsPendingLayout';
import { reportsPendingRowsMock } from '../data';
import ReportsPendingDeadlineCell from './ReportsPendingDeadlineCell';
import ReportsPendingRowActions from './ReportsPendingRowActions';
import ReportsPendingStatusBadge from './ReportsPendingStatusBadge';

const ReportsPendingTable: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className={REPORTS_PENDING_TABLE_WRAP}>
      <table className={REPORTS_PENDING_TABLE}>
        <thead className={REPORTS_PENDING_TABLE_HEAD}>
          <tr>
            <th scope="col" className={REPORTS_PENDING_TH}>
              {t('encadrant.common.col.student')}
            </th>
            <th scope="col" className={REPORTS_PENDING_TH}>
              {t('encadrant.common.col.report')}
            </th>
            <th scope="col" className={REPORTS_PENDING_TH}>
              {t('encadrant.common.col.deadline')}
            </th>
            <th scope="col" className={REPORTS_PENDING_TH}>
              {t('encadrant.common.col.status')}
            </th>
            <th scope="col" className={REPORTS_PENDING_TH}>
              {t('encadrant.common.col.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {reportsPendingRowsMock.map((row) => (
            <tr key={row.id} className={REPORTS_PENDING_ROW}>
              <td className={`${REPORTS_PENDING_TD} font-medium`}>{row.student}</td>
              <td className={REPORTS_PENDING_TD}>{row.report}</td>
              <td className={REPORTS_PENDING_TD}>
                <ReportsPendingDeadlineCell deadline={row.deadline} lateNote={row.lateNote} />
              </td>
              <td className={REPORTS_PENDING_TD}>
                <ReportsPendingStatusBadge status={row.status} />
              </td>
              <td className={REPORTS_PENDING_TD}>
                <ReportsPendingRowActions />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsPendingTable;
