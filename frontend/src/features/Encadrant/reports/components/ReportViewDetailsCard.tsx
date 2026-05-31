import { FunctionComponent } from 'react';
import { CheckCircle2, Download, Eye, FileText, Pencil, Trash2 } from 'lucide-react';
import {
  REPORT_VIEW_ACTIONS_ROW,
  REPORT_VIEW_DELETE_BTN,
  REPORT_VIEW_DETAILS_CARD,
  REPORT_VIEW_DETAILS_HEADER,
  REPORT_VIEW_DETAILS_HEADER_MAIN,
  REPORT_VIEW_FILE_ACTIONS,
  REPORT_VIEW_FILE_CARD,
  REPORT_VIEW_FILE_ICON_WRAP,
  REPORT_VIEW_FILE_MAIN,
  REPORT_VIEW_FILE_META,
  REPORT_VIEW_FILE_NAME,
  REPORT_VIEW_INFO_FIELD,
  REPORT_VIEW_INFO_GRID,
  REPORT_VIEW_INFO_LABEL,
  REPORT_VIEW_INFO_VALUE,
  REPORT_VIEW_OUTLINE_BTN,
  REPORT_VIEW_REVIEW_BADGE,
  REPORT_VIEW_SECONDARY_BTN,
  REPORT_VIEW_SECTION_TITLE,
  REPORT_VIEW_SUBTITLE,
  REPORT_VIEW_SUMMARY_TEXT,
  REPORT_VIEW_TITLE,
  REPORT_VIEW_VALIDATE_BTN,
} from '../constants/reportViewLayout';
import type { ReportViewDetail } from '../types';

interface ReportViewDetailsCardProps {
  report: ReportViewDetail;
}

const ReportViewDetailsCard: FunctionComponent<ReportViewDetailsCardProps> = ({ report }) => (
  <section className={REPORT_VIEW_DETAILS_CARD} aria-label="Report details">
    <header className={REPORT_VIEW_DETAILS_HEADER}>
      <div className={REPORT_VIEW_DETAILS_HEADER_MAIN}>
        <h1 className={REPORT_VIEW_TITLE}>{report.title}</h1>
        <p className={REPORT_VIEW_SUBTITLE}>
          Submitted by {report.submittedBy} on {report.submittedOn}
        </p>
      </div>
      {report.reviewStatus === 'pending_review' ? (
        <span className={REPORT_VIEW_REVIEW_BADGE}>Pending Review</span>
      ) : (
        <span className="inline-flex shrink-0 items-center rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-xs font-medium leading-4 text-[#15803d]">
          Validated
        </span>
      )}
    </header>

    <div className={REPORT_VIEW_INFO_GRID}>
      <div className={REPORT_VIEW_INFO_FIELD}>
        <span className={REPORT_VIEW_INFO_LABEL}>Submitted Date</span>
        <p className={REPORT_VIEW_INFO_VALUE}>{report.submittedDate}</p>
      </div>
      <div className={REPORT_VIEW_INFO_FIELD}>
        <span className={REPORT_VIEW_INFO_LABEL}>Deadline</span>
        <p className={REPORT_VIEW_INFO_VALUE}>{report.deadline}</p>
      </div>
    </div>

    <div className="flex w-full min-w-0 flex-col gap-3">
      <h2 className={REPORT_VIEW_SECTION_TITLE}>Report File</h2>
      <article className={REPORT_VIEW_FILE_CARD}>
        <div className={REPORT_VIEW_FILE_ICON_WRAP}>
          <FileText className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className={REPORT_VIEW_FILE_MAIN}>
          <p className={REPORT_VIEW_FILE_NAME}>{report.fileName}</p>
          <p className={REPORT_VIEW_FILE_META}>{report.fileMeta}</p>
        </div>
        <div className={REPORT_VIEW_FILE_ACTIONS}>
          <button type="button" className={REPORT_VIEW_OUTLINE_BTN}>
            <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            Preview
          </button>
          <button type="button" className={REPORT_VIEW_OUTLINE_BTN}>
            <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            Download
          </button>
        </div>
      </article>
    </div>

    <div className="flex w-full min-w-0 flex-col gap-3">
      <h2 className={REPORT_VIEW_SECTION_TITLE}>Summary</h2>
      <p className={REPORT_VIEW_SUMMARY_TEXT}>{report.summary}</p>
    </div>

    <div className={REPORT_VIEW_ACTIONS_ROW}>
      <button type="button" className={REPORT_VIEW_VALIDATE_BTN}>
        <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        Validate Report
      </button>
      <button type="button" className={REPORT_VIEW_SECONDARY_BTN}>
        <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        Request Changes
      </button>
      <button type="button" className={REPORT_VIEW_DELETE_BTN}>
        <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        Delete
      </button>
    </div>
  </section>
);

export default ReportViewDetailsCard;
