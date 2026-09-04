import { FunctionComponent, useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  REPORT_VIEW_ATTACH_BTN,
  REPORT_VIEW_COMMENT_AUTHOR,
  REPORT_VIEW_COMMENT_BUBBLE,
  REPORT_VIEW_COMMENT_BUBBLE_STUDENT,
  REPORT_VIEW_COMMENT_BUBBLE_WRAP,
  REPORT_VIEW_COMMENT_BUBBLE_WRAP_STUDENT,
  REPORT_VIEW_COMMENT_BUBBLE_WRAP_YOU,
  REPORT_VIEW_COMMENT_BUBBLE_YOU,
  REPORT_VIEW_COMMENT_INPUT,
  REPORT_VIEW_COMMENT_TIME,
  REPORT_VIEW_COMMENTS_CARD,
  REPORT_VIEW_COMMENTS_HEADER,
  REPORT_VIEW_COMMENTS_INPUT_ROW,
  REPORT_VIEW_COMMENTS_LIST,
  REPORT_VIEW_COMMENTS_SUBTITLE,
  REPORT_VIEW_COMMENTS_TITLE,
  REPORT_VIEW_SEND_BTN,
} from '../constants/reportViewLayout';
import type { ReportViewComment } from '../types';

interface ReportViewCommentsPanelProps {
  comments: ReportViewComment[];
}

const ReportViewCommentsPanel: FunctionComponent<ReportViewCommentsPanelProps> = ({ comments }) => {
  const { t } = useTranslation();
  const [commentText, setCommentText] = useState('');

  return (
    <aside className={REPORT_VIEW_COMMENTS_CARD} aria-label={t('encadrant.reports.comments.title')}>
      <header className={REPORT_VIEW_COMMENTS_HEADER}>
        <h2 className={REPORT_VIEW_COMMENTS_TITLE}>{t('encadrant.reports.comments.title')}</h2>
        <p className={REPORT_VIEW_COMMENTS_SUBTITLE}>{t('encadrant.reports.comments.discuss')}</p>
      </header>

      <div className={REPORT_VIEW_COMMENTS_LIST}>
        {comments.map((comment) => {
          const isEncadrant = comment.author === 'encadrant';

          return (
            <div
              key={comment.id}
              className={`${REPORT_VIEW_COMMENT_BUBBLE_WRAP} ${
                isEncadrant
                  ? REPORT_VIEW_COMMENT_BUBBLE_WRAP_YOU
                  : REPORT_VIEW_COMMENT_BUBBLE_WRAP_STUDENT
              }`}
            >
              <p className={REPORT_VIEW_COMMENT_AUTHOR}>{comment.authorName}</p>
              <div
                className={`${REPORT_VIEW_COMMENT_BUBBLE} ${
                  isEncadrant
                    ? REPORT_VIEW_COMMENT_BUBBLE_YOU
                    : REPORT_VIEW_COMMENT_BUBBLE_STUDENT
                }`}
              >
                {comment.message}
              </div>
              <p className={REPORT_VIEW_COMMENT_TIME}>{comment.timestamp}</p>
            </div>
          );
        })}
      </div>

      <div className={REPORT_VIEW_COMMENTS_INPUT_ROW}>
        <button
          type="button"
          className={REPORT_VIEW_ATTACH_BTN}
          aria-label={t('encadrant.reports.comments.attach')}
        >
          <Paperclip className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={t('encadrant.reports.comments.placeholder')}
          className={REPORT_VIEW_COMMENT_INPUT}
          aria-label={t('encadrant.reports.comments.placeholder')}
        />
        <button
          type="button"
          className={REPORT_VIEW_SEND_BTN}
          aria-label={t('encadrant.reports.comments.send')}
        >
          <Send className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </aside>
  );
};

export default ReportViewCommentsPanel;
