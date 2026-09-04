import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TASK_ASSIGNEE_PROFILES } from '../../../Encadrant/task/data/taskAssignees';
import type { ReportComment } from '../../types';
import {
  headingMatchesSection,
  sectionIdLabel,
} from '../../utils/reportSectionComments';

interface ReportCommentPinsProps {
  containerRef: React.RefObject<HTMLElement | null>;
  comments: ReportComment[];
  contentRevision?: string;
  onOpenComments?: () => void;
}

interface PinMarker {
  key: string;
  top: number;
  left: number;
  author: string;
  count: number;
  sectionLabel: string;
  excerpt: string;
  headingTitle: string;
}

function resolveAvatar(name: string): { url: string; initials: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length === 0
      ? '?'
      : parts.length === 1
        ? parts[0].slice(0, 2).toUpperCase()
        : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();

  if (/leila|mansouri/i.test(name)) {
    return { url: TASK_ASSIGNEE_PROFILES.admin.avatarUrl, initials: initials || 'LM' };
  }
  return { url: TASK_ASSIGNEE_PROFILES.bennani.avatarUrl, initials: initials || 'AB' };
}

const ReportCommentPins: FunctionComponent<ReportCommentPinsProps> = ({
  containerRef,
  comments,
  contentRevision = '',
  onOpenComments,
}) => {
  const { t } = useTranslation();
  const [pins, setPins] = useState<PinMarker[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const measure = useCallback(() => {
    const root = containerRef.current;
    const openComments = comments.filter((c) => c.role === 'supervisor' && !c.resolved);
    if (!root || openComments.length === 0) {
      setPins([]);
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const headings = Array.from(
      root.querySelectorAll<HTMLElement>(
        '.student-report-writing-area h1, .student-report-writing-area h2, .student-report-writing-area h3',
      ),
    );

    const next: PinMarker[] = [];

    headings.forEach((headingEl, index) => {
      const title = (headingEl.textContent || '').trim();
      if (!title) return;

      const matched = openComments.filter((c) => headingMatchesSection(title, c.sectionId));
      if (matched.length === 0) return;

      const rect = headingEl.getBoundingClientRect();
      const primary = matched[0];
      next.push({
        key: `${primary.sectionId}-${index}`,
        top: rect.top - rootRect.top + rect.height / 2 - 14,
        left: Math.max(4, rect.left - rootRect.left - 34),
        author: primary.author,
        count: matched.length,
        sectionLabel: sectionIdLabel(primary.sectionId),
        excerpt: primary.text,
        headingTitle: title,
      });
    });

    setPins(next);
  }, [comments, containerRef]);

  useEffect(() => {
    measure();

    const root = containerRef.current;
    if (!root) return;

    const onScrollOrResize = () => measure();
    const canvas = root.closest('.student-report-editor-canvas');
    canvas?.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    const resizeObserver = new ResizeObserver(onScrollOrResize);
    resizeObserver.observe(root);

    const mutationObserver = new MutationObserver(onScrollOrResize);
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const interval = window.setInterval(measure, 1200);

    return () => {
      canvas?.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.clearInterval(interval);
    };
  }, [containerRef, measure, contentRevision]);

  if (pins.length === 0) return null;

  return (
    <div className="student-report-comment-pins" aria-label={t('student.reports.editor.commentPinsAria')}>
      {pins.map((pin) => {
        const avatar = resolveAvatar(pin.author);
        const imageFailed = failedImages[pin.key];
        const isOpen = openKey === pin.key;

        return (
          <div
            key={pin.key}
            className={`student-report-comment-pin ${isOpen ? 'is-open' : ''}`}
            style={{ top: pin.top, left: pin.left }}
          >
            <button
              type="button"
              className="student-report-comment-pin__btn"
              title={t('student.reports.editor.commentPinTitle', {
                name: pin.author,
                section: pin.sectionLabel,
              })}
              aria-expanded={isOpen}
              onClick={() => setOpenKey((prev) => (prev === pin.key ? null : pin.key))}
            >
              {!imageFailed && avatar.url ? (
                <img
                  src={avatar.url}
                  alt=""
                  onError={() => setFailedImages((prev) => ({ ...prev, [pin.key]: true }))}
                />
              ) : (
                <span className="student-report-comment-pin__fallback">{avatar.initials}</span>
              )}
              <span className="student-report-comment-pin__dot" aria-hidden>
                <MessageCircle className="h-2.5 w-2.5" />
              </span>
              {pin.count > 1 && (
                <span className="student-report-comment-pin__count">{pin.count}</span>
              )}
            </button>

            {isOpen && (
              <div className="student-report-comment-pin__card" role="dialog">
                <div className="student-report-comment-pin__card-head">
                  <strong>{pin.author}</strong>
                  <span>{pin.sectionLabel}</span>
                </div>
                <p>{pin.excerpt}</p>
                {onOpenComments && (
                  <button
                    type="button"
                    className="student-report-comment-pin__card-action"
                    onClick={() => {
                      onOpenComments();
                      setOpenKey(null);
                    }}
                  >
                    {t('student.reports.editor.sectionCommentView')}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReportCommentPins;
