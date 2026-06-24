import { FunctionComponent, useCallback, type KeyboardEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  MessageSquare,
  Paperclip,
} from 'lucide-react';
import { typeIcon } from '../../../admin/announcements-stage/utils/announcementMeta';
import type { FullAnnouncementItem } from '../types';
import { getStudentAnnouncementDetailPath, STUDENT_ANNOUNCEMENTS_CHAT_PATH } from '../constants/routes';
import AnnouncementBadge from './AnnouncementBadge';
import AnnouncementCardActions from './AnnouncementCardActions';

interface FullAnnouncementCardProps {
  item: FullAnnouncementItem;
  variant: 'recommended' | 'list';
  onBookmarkChange?: (state: { isSaved: boolean; isFavorited: boolean }) => void;
}

const FullAnnouncementCard: FunctionComponent<FullAnnouncementCardProps> = ({
  item,
  variant,
  onBookmarkChange,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const TypeIcon = typeIcon({ code: item.typeCode, icon: item.typeIcon });
  const fileAttachments = (item.attachments ?? []).filter((a) => a.fileUrl || a.externalUrl);

  const handleAskQuestion = useCallback(() => {
    navigate(`${STUDENT_ANNOUNCEMENTS_CHAT_PATH}?announcement=${item.id}`);
  }, [navigate, item.id]);

  const handleOpenDetail = useCallback(() => {
    navigate(getStudentAnnouncementDetailPath(item.id));
  }, [navigate, item.id]);

  const stopCardNav = useCallback((event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleOpenDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpenDetail();
        }
      }}
      className={`student-announcement-card student-announcement-card--visual student-announcement-card--clickable${
        variant === 'recommended' ? ' student-announcement-card--recommended' : ''
      }`}
    >
      <div className="student-announcement-card__cover">
        {item.coverImageUrl ? (
          <img
            src={item.coverImageUrl}
            alt=""
            className="student-announcement-card__cover-image"
            loading="lazy"
          />
        ) : (
          <div
            className="student-announcement-card__cover-placeholder"
            style={
              item.typeColor
                ? {
                    backgroundColor: `color-mix(in srgb, ${item.typeColor} 14%, var(--admin-bg-elevated))`,
                    color: item.typeColor,
                  }
                : undefined
            }
            aria-hidden
          >
            <TypeIcon className="h-10 w-10 opacity-80" strokeWidth={1.5} />
          </div>
        )}

        <div className="student-announcement-card__cover-actions" onClick={stopCardNav} onKeyDown={stopCardNav}>
          {variant === 'recommended' && item.matchScore != null ? (
            <span className="student-announcement-card__match-badge" aria-label={t('student.announcements.matchScore', { score: item.matchScore })}>
              {t('student.announcements.matchScore', { score: item.matchScore })}
            </span>
          ) : null}
          <AnnouncementCardActions
            announcementId={item.id}
            initialSaved={item.isSaved}
            initialFavorited={item.isFavorited}
            onBookmarkChange={onBookmarkChange}
          />
        </div>
      </div>

      <div className="student-announcement-card__body">
        <div className="student-announcement-card__badges">
          <AnnouncementBadge
            typeCode={item.typeCode}
            typeName={item.typeName}
            iconKey={item.typeIcon}
            typeColor={item.typeColor}
          />
        </div>

        <h3 className="student-announcement-card__title" dir="auto">
          {item.title}
        </h3>

        {item.company && item.company !== '—' ? (
          <p className="student-announcement-card__company" dir="auto">
            <Building2 className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 truncate">{item.company}</span>
          </p>
        ) : null}

        {item.description ? (
          <p className="student-announcement-card__description" dir="auto">
            {item.description}
          </p>
        ) : null}

        {item.internshipDetails ? (
          <div className="student-announcement-card__details">
            {item.internshipDetails.location ? <span>{item.internshipDetails.location}</span> : null}
            {item.internshipDetails.duration ? <span>{item.internshipDetails.duration}</span> : null}
            {item.internshipDetails.compensation ? (
              <span>{item.internshipDetails.compensation}</span>
            ) : null}
          </div>
        ) : null}

        {fileAttachments.length > 0 ? (
          <ul
            className="student-announcement-card__attachments"
            aria-label={t('student.announcements.attachmentsAria')}
          >
            {fileAttachments.slice(0, 3).map((att) => {
              const href = att.fileUrl ?? att.externalUrl ?? '#';
              const label = att.label || att.originalFilename || t('student.announcements.attachmentFallback');
              return (
                <li key={att.id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="student-announcement-card__attachment"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Paperclip className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                    <span className="truncate">{label}</span>
                    <FileText className="size-3.5 shrink-0 opacity-60" strokeWidth={1.75} aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="student-announcement-card__footer">
          <span className="student-announcement-card__meta-line" dir="auto">
            <Calendar className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{item.postedDate}</span>
          </span>
          {item.applicationDeadline ? (
            <span
              className={`student-announcement-card__meta-line ${
                item.deadlineUrgent ? 'student-announcement-card__meta-line--urgent' : ''
              }`}
              dir="auto"
            >
              <Clock className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
              <span>{item.deadlineLabel}</span>
            </span>
          ) : null}
        </div>

        <div className="student-announcement-card__engagement" onClick={stopCardNav} onKeyDown={stopCardNav}>
          <button
            type="button"
            className="student-announcement-card__comment-btn"
            onClick={handleAskQuestion}
            aria-label={t('student.announcements.askQuestion')}
          >
            <span className="student-announcement-card__comment-icon" aria-hidden>
              <MessageSquare className="size-[1.05rem]" strokeWidth={1.75} />
            </span>
            <span>{t('student.announcements.commentAction')}</span>
          </button>

          {item.externalLink ? (
            <a
              href={item.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="student-announcement-card__comment-btn student-announcement-card__comment-btn--muted"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="student-announcement-card__comment-icon" aria-hidden>
                <ExternalLink className="size-[1.05rem]" strokeWidth={1.75} />
              </span>
              <span>{t('student.announcements.openLink')}</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default FullAnnouncementCard;
