import { FunctionComponent, useMemo, useState } from 'react';
import {
  Check,
  MessageSquare,
  Reply,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type {
  AnalysisIssue,
  AnalysisMode,
  AnalysisUiState,
  PageAnalysisResult,
} from '../../types/pageAnalysis';
import type { ReportComment, ReportRightPanelTab } from '../../types';
import AcademicReviewerPanel from './AcademicReviewerPanel';

interface ReportRightPanelProps {
  comments: ReportComment[];
  onResolve: (id: string) => void;
  onMarkFixed: (id: string) => void;
  onReply: (id: string, text: string) => void;
  collapsed?: boolean;
  /** Academic reviewer */
  reviewerState?: AnalysisUiState;
  reviewerResult?: PageAnalysisResult | null;
  reviewerError?: string | null;
  reviewerIssues?: AnalysisIssue[];
  reviewerLoading?: boolean;
  currentPageNumber?: number;
  onAnalyzePage?: () => void;
  onAnalyzeMode?: (mode: AnalysisMode) => void;
  onViewIssue?: (issue: AnalysisIssue) => void;
  onIgnoreIssue?: (id: string) => void;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatCommentDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function sectionLabel(sectionId: string): string {
  const map: Record<string, string> = {
    intro: 'Introduction',
    'lit-review': 'Revue de littérature',
    methodology: 'Méthodologie',
    results: 'Résultats',
    conclusion: 'Conclusion',
  };
  return map[sectionId] ?? sectionId;
}

const ReportRightPanel: FunctionComponent<ReportRightPanelProps> = ({
  comments,
  onResolve,
  onMarkFixed,
  onReply,
  collapsed = false,
  reviewerState = 'idle',
  reviewerResult = null,
  reviewerError = null,
  reviewerIssues = [],
  reviewerLoading = false,
  currentPageNumber = 1,
  onAnalyzePage,
  onAnalyzeMode,
  onViewIssue,
  onIgnoreIssue,
}) => {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<ReportRightPanelTab>('ai');
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const openCount = useMemo(
    () => comments.filter((c) => !c.resolved).length,
    [comments],
  );

  const tabs: { id: ReportRightPanelTab; label: string; count?: number }[] = [
    { id: 'comments', label: t('student.reports.panel.comments'), count: openCount },
    { id: 'ai', label: t('student.reports.panel.ai') },
  ];

  if (collapsed) return null;

  return (
    <aside className="student-report-right-panel" aria-label={t('student.reports.panel.title')}>
      <div className="student-report-panel-tabs" role="tablist">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`student-report-panel-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            <span className="student-report-panel-tab__label">{label}</span>
            {typeof count === 'number' && count > 0 && (
              <span className="student-report-panel-tab__count">{count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="student-report-panel-content">
        {tab === 'comments' && (
          <>
            {comments.length === 0 ? (
              <div className="student-report-panel-empty">
                <MessageSquare className="student-report-panel-empty__icon" aria-hidden />
                <p className="student-report-panel-empty__text">{t('student.reports.panel.noComments')}</p>
              </div>
            ) : (
              <div className="student-report-comment-list">
                {comments.map((c) => (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    locale={i18n.language}
                    replyValue={replyDraft[c.id] ?? ''}
                    onReplyChange={(v) => setReplyDraft((d) => ({ ...d, [c.id]: v }))}
                    onResolve={() => onResolve(c.id)}
                    onMarkFixed={() => onMarkFixed(c.id)}
                    onSubmitReply={() => {
                      const text = replyDraft[c.id]?.trim();
                      if (text) {
                        onReply(c.id, text);
                        setReplyDraft((d) => ({ ...d, [c.id]: '' }));
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'ai' && (
          <AcademicReviewerPanel
            state={reviewerState}
            result={reviewerResult}
            error={reviewerError}
            visibleIssues={reviewerIssues}
            isLoading={reviewerLoading}
            currentPageNumber={currentPageNumber}
            onAnalyzePage={() => onAnalyzePage?.()}
            onAnalyzeMode={(mode) => onAnalyzeMode?.(mode)}
            onViewIssue={(issue) => onViewIssue?.(issue)}
            onIgnoreIssue={(id) => onIgnoreIssue?.(id)}
          />
        )}
      </div>
    </aside>
  );
};

function CommentCard({
  comment,
  locale,
  replyValue,
  onReplyChange,
  onResolve,
  onMarkFixed,
  onSubmitReply,
}: {
  comment: ReportComment;
  locale: string;
  replyValue: string;
  onReplyChange: (v: string) => void;
  onResolve: () => void;
  onMarkFixed: () => void;
  onSubmitReply: () => void;
}) {
  const { t } = useTranslation();
  const canReply = Boolean(replyValue.trim());

  return (
    <article
      className={`student-report-comment ${comment.resolved ? 'is-resolved' : ''} ${comment.fixed ? 'is-fixed' : ''}`}
    >
      <div className="student-report-comment__rail" aria-hidden />

      <div className="student-report-comment__header">
        <span className="student-report-comment__avatar" aria-hidden>
          {initialsFromName(comment.author)}
        </span>
        <div className="student-report-comment__meta">
          <div className="student-report-comment__title-row">
            <span className="student-report-comment__author">{comment.author}</span>
            <span className="student-report-comment__badge">
              {t(`student.reports.panel.roles.${comment.role}`)}
            </span>
          </div>
          <div className="student-report-comment__submeta">
            <span className="student-report-comment__section">{sectionLabel(comment.sectionId)}</span>
            <span className="student-report-comment__dot" aria-hidden />
            <span className="student-report-comment__time">
              {formatCommentDate(comment.createdAt, locale)}
            </span>
          </div>
        </div>
        {(comment.fixed || comment.resolved) && (
          <span
            className={`student-report-comment__status ${comment.resolved ? 'is-resolved' : 'is-fixed'}`}
          >
            <Check className="h-3 w-3" aria-hidden />
            {comment.resolved
              ? t('student.reports.panel.resolved')
              : t('student.reports.panel.markedFixed')}
          </span>
        )}
      </div>

      <p className="student-report-comment__body">{comment.text}</p>

      {comment.replies.length > 0 && (
        <div className="student-report-comment__thread">
          {comment.replies.map((r) => (
            <div key={r.id} className="student-report-comment__reply">
              <span className="student-report-comment__reply-avatar" aria-hidden>
                {initialsFromName(r.author)}
              </span>
              <div className="student-report-comment__reply-content">
                <div className="student-report-comment__reply-head">
                  <strong>{r.author}</strong>
                  <span>{formatCommentDate(r.createdAt, locale)}</span>
                </div>
                <p>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!comment.resolved && (
        <>
          <div className="student-report-comment__actions">
            <button
              type="button"
              className="student-report-comment-action student-report-comment-action--resolve"
              onClick={onResolve}
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
              {t('student.reports.panel.resolve')}
            </button>
            <button
              type="button"
              className="student-report-comment-action student-report-comment-action--fix"
              onClick={onMarkFixed}
              disabled={comment.fixed}
            >
              <Wrench className="h-3.5 w-3.5" aria-hidden />
              {comment.fixed
                ? t('student.reports.panel.markedFixed')
                : t('student.reports.panel.markFixed')}
            </button>
          </div>

          <div className="student-report-comment__composer">
            <input
              type="text"
              value={replyValue}
              onChange={(e) => onReplyChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canReply) onSubmitReply();
              }}
              placeholder={t('student.reports.panel.replyPlaceholder')}
              className="student-report-comment__input"
              aria-label={t('student.reports.panel.replyPlaceholder')}
            />
            <button
              type="button"
              className="student-report-comment__send"
              onClick={onSubmitReply}
              disabled={!canReply}
              aria-label={t('student.reports.panel.sendReply')}
              title={t('student.reports.panel.sendReply')}
            >
              <Reply className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default ReportRightPanel;
