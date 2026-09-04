import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  REPORT_DETAIL_MOBILE_CARD,
  REPORT_DETAIL_MOBILE_FIELD,
  REPORT_DETAIL_MOBILE_LABEL,
  REPORT_DETAIL_ROW_CELL,
  REPORT_DETAIL_ROW_TITLE,
  REPORT_DETAIL_TABLE_BODY,
  REPORT_DETAIL_TABLE_HEAD,
  REPORT_DETAIL_TABLE_ROW,
} from '../constants/reportDetailLayout';
import { REPORT_ROW_STATUS_STYLES } from '../constants/reportDetailStyles';
import type { ReportDetailRow } from '../types';
import ReportsDetailRowActions from './ReportsDetailRowActions';

interface ReportsDetailTableProps {
  studentId: string;
  rows: ReportDetailRow[];
}

const ReportsDetailTable: FunctionComponent<ReportsDetailTableProps> = ({ studentId, rows }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full min-w-0">
      <div className={REPORT_DETAIL_TABLE_HEAD} role="row">
        <span role="columnheader">{t('encadrant.reports.cols.reportTitle')}</span>
        <span role="columnheader">{t('encadrant.reports.cols.submissionDate')}</span>
        <span role="columnheader">{t('encadrant.reports.cols.deadline')}</span>
        <span role="columnheader">{t('encadrant.reports.cols.status')}</span>
        <span role="columnheader">{t('encadrant.reports.cols.actions')}</span>
      </div>

      <div className={REPORT_DETAIL_TABLE_BODY}>
        {rows.map((row) => {
          const statusStyle = REPORT_ROW_STATUS_STYLES[row.status];

          return (
            <div key={row.id}>
              <div className={REPORT_DETAIL_TABLE_ROW} role="row">
                <p className={REPORT_DETAIL_ROW_TITLE} role="cell">
                  {row.title}
                </p>
                <span className={REPORT_DETAIL_ROW_CELL} role="cell">
                  {row.submissionDate}
                </span>
                <span className={REPORT_DETAIL_ROW_CELL} role="cell">
                  {row.deadline}
                </span>
                <span role="cell">
                  <span className={statusStyle.badge}>{t(statusStyle.labelKey)}</span>
                </span>
                <div className="min-w-0" role="cell">
                  <ReportsDetailRowActions studentId={studentId} row={row} />
                </div>
              </div>

              <article className={REPORT_DETAIL_MOBILE_CARD} aria-label={row.title}>
                <p className={REPORT_DETAIL_ROW_TITLE}>{row.title}</p>

                <div className={REPORT_DETAIL_MOBILE_FIELD}>
                  <span className={REPORT_DETAIL_MOBILE_LABEL}>
                    {t('encadrant.reports.cols.submissionDate')}
                  </span>
                  <span className={REPORT_DETAIL_ROW_CELL}>{row.submissionDate}</span>
                </div>

                <div className={REPORT_DETAIL_MOBILE_FIELD}>
                  <span className={REPORT_DETAIL_MOBILE_LABEL}>
                    {t('encadrant.reports.cols.deadline')}
                  </span>
                  <span className={REPORT_DETAIL_ROW_CELL}>{row.deadline}</span>
                </div>

                <div className={REPORT_DETAIL_MOBILE_FIELD}>
                  <span className={REPORT_DETAIL_MOBILE_LABEL}>
                    {t('encadrant.reports.cols.status')}
                  </span>
                  <span className={statusStyle.badge}>{t(statusStyle.labelKey)}</span>
                </div>

                <div className={REPORT_DETAIL_MOBILE_FIELD}>
                  <span className={REPORT_DETAIL_MOBILE_LABEL}>
                    {t('encadrant.reports.cols.actions')}
                  </span>
                  <ReportsDetailRowActions studentId={studentId} row={row} />
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsDetailTable;
