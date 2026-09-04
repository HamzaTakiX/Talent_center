import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  REPORT_DETAIL_HEADER,
  REPORT_DETAIL_HEADER_MAIN,
  REPORT_DETAIL_SUBTITLE,
  REPORT_DETAIL_TITLE,
} from '../constants/reportDetailLayout';
import { REPORTS_STATUS_STYLES } from '../constants/reportsStyles';
import type { StudentReportDetail } from '../types';

interface ReportsDetailHeaderProps {
  detail: StudentReportDetail;
}

const ReportsDetailHeader: FunctionComponent<ReportsDetailHeaderProps> = ({ detail }) => {
  const { t } = useTranslation();
  const statusStyle = REPORTS_STATUS_STYLES[detail.status];

  return (
    <header className={REPORT_DETAIL_HEADER}>
      <div className={REPORT_DETAIL_HEADER_MAIN}>
        <h1 className={REPORT_DETAIL_TITLE}>
          {t('encadrant.reports.detail.title', { name: detail.name })}
        </h1>
        <p className={REPORT_DETAIL_SUBTITLE}>
          {detail.level} • {t('encadrant.reports.detail.subtitle', { count: detail.totalReports })}
        </p>
      </div>
      <span className={statusStyle.badge}>{t(statusStyle.labelKey)}</span>
    </header>
  );
};

export default ReportsDetailHeader;
