import { FunctionComponent, useState } from 'react';
import {
  Check,
  Loader2,
  MessageSquare,
  Reply,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { aiAssistantActions } from '../../data/reportPlatformMock';
import type { ReportComment, ReportRightPanelTab } from '../../types';

interface ReportRightPanelProps {
  comments: ReportComment[];
  onResolve: (id: string) => void;
  onMarkFixed: (id: string) => void;
  onReply: (id: string, text: string) => void;
  collapsed?: boolean;
}

const ReportRightPanel: FunctionComponent<ReportRightPanelProps> = ({
  comments,
  onResolve,
  onMarkFixed,
  onReply,
  collapsed = false,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ReportRightPanelTab>('comments');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const allComments = comments;

  const tabs: { id: ReportRightPanelTab; label: string }[] = [
    { id: 'comments', label: t('student.reports.panel.comments') },
    { id: 'suggestions', label: t('student.reports.panel.suggestions') },
    { id: 'supervisor', label: t('student.reports.panel.supervisor') },
    { id: 'ai', label: t('student.reports.panel.ai') },
  ];

  const handleAiAction = (actionId: string) => {
    setAiResult(t(`student.reports.ai.results.${actionId}`));
  };

  if (collapsed) return null;

  return (
    <aside className="student-report-right-panel" aria-label={t('student.reports.panel.title')}>
      <div className="student-report-panel-tabs" role="tablist">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`student-report-panel-tab ${tab === id ? 'is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="student-report-panel-content">
        {tab === 'comments' && (
          <>
            {allComments.length === 0 ? (
              <p className="text-sm text-[var(--admin-text-muted)]">{t('student.reports.panel.noComments')}</p>
            ) : (
              allComments.map((c) => (
                <CommentCard
                  key={c.id}
                  comment={c}
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
              ))
            )}
          </>
        )}

        {tab === 'suggestions' && (
          <div className="space-y-3">
            {[
              t('student.reports.panel.suggestion1'),
              t('student.reports.panel.suggestion2'),
              t('student.reports.panel.suggestion3'),
            ].map((s, i) => (
              <div key={i} className="student-report-comment">
                <Sparkles className="mb-1 h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
                <p className="m-0 text-sm">{s}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'supervisor' && (
          <>
            {comments.filter((c) => c.role === 'supervisor').length === 0 ? (
              <p className="text-sm text-[var(--admin-text-muted)]">{t('student.reports.panel.noSupervisorFeedback')}</p>
            ) : (
              comments
                .filter((c) => c.role === 'supervisor')
                .map((c) => (
                  <div key={c.id} className={`student-report-comment ${c.fixed ? 'is-fixed' : ''}`}>
                    <div className="mb-1 text-xs font-semibold text-[var(--admin-brand)]">{c.author}</div>
                    <p className="m-0 text-sm">{c.text}</p>
                    {c.fixed && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400">
                        <Check className="h-3 w-3" aria-hidden />
                        {t('student.reports.panel.markedFixed')}
                      </span>
                    )}
                  </div>
                ))
            )}
          </>
        )}

        {tab === 'ai' && (
          <div>
            <p className="mb-3 text-xs text-[var(--admin-text-muted)]">{t('student.reports.ai.subtitle')}</p>
            {aiAssistantActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="student-report-ai-action"
                onClick={() => handleAiAction(action.id)}
              >
                <Sparkles className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />
                {t(`student.reports.ai.${action.labelKey}`)}
              </button>
            ))}
            {aiResult && (
              <div className="student-report-ai-result">
                <Loader2 className="mb-2 hidden h-4 w-4 animate-spin" aria-hidden />
                {aiResult}
              </div>
            )}
          </div>
        )}

      </div>
    </aside>
  );
};

function CommentCard({
  comment,
  replyValue,
  onReplyChange,
  onResolve,
  onMarkFixed,
  onSubmitReply,
}: {
  comment: ReportComment;
  replyValue: string;
  onReplyChange: (v: string) => void;
  onResolve: () => void;
  onMarkFixed: () => void;
  onSubmitReply: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`student-report-comment ${comment.resolved ? 'is-resolved' : ''} ${comment.fixed ? 'is-fixed' : ''}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--admin-text)]">{comment.author}</span>
        <MessageSquare className="h-3.5 w-3.5 text-[var(--admin-text-muted)]" aria-hidden />
      </div>
      <p className="m-0 text-sm leading-relaxed">{comment.text}</p>
      {comment.replies.map((r) => (
        <div key={r.id} className="ml-3 mt-2 border-l-2 border-[var(--admin-border)] pl-2 text-xs text-[var(--admin-text-muted)]">
          <strong>{r.author}:</strong> {r.text}
        </div>
      ))}
      {!comment.resolved && (
        <>
          <div className="student-report-comment__actions">
            <button type="button" className="student-report-comment-action" onClick={onResolve}>
              <Check className="mr-1 inline h-3 w-3" aria-hidden />
              {t('student.reports.panel.resolve')}
            </button>
            <button type="button" className="student-report-comment-action" onClick={onMarkFixed}>
              <Wrench className="mr-1 inline h-3 w-3" aria-hidden />
              {t('student.reports.panel.markFixed')}
            </button>
          </div>
          <div className="mt-2 flex gap-1">
            <input
              type="text"
              value={replyValue}
              onChange={(e) => onReplyChange(e.target.value)}
              placeholder={t('student.reports.panel.replyPlaceholder')}
              className="flex-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 py-1 text-xs text-[var(--admin-text)] outline-none focus:border-[var(--admin-brand)]"
            />
            <button type="button" className="student-report-comment-action" onClick={onSubmitReply}>
              <Reply className="h-3 w-3" aria-hidden />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ReportRightPanel;
