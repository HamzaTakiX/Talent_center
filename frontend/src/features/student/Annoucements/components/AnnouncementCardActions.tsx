import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, Heart } from 'lucide-react';
import { studentAnnouncementsApi } from '../api/studentAnnouncementsApi';
import type { StudentAnnouncementBookmarkType } from '../types';

interface AnnouncementCardActionsProps {
  announcementId: string;
  initialSaved?: boolean;
  initialFavorited?: boolean;
  onBookmarkChange?: (state: { isSaved: boolean; isFavorited: boolean }) => void;
}

const AnnouncementCardActions: FunctionComponent<AnnouncementCardActionsProps> = ({
  announcementId,
  initialSaved = false,
  initialFavorited = false,
  onBookmarkChange,
}) => {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(initialSaved);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState<StudentAnnouncementBookmarkType | null>(null);

  useEffect(() => {
    setSaved(initialSaved);
    setFavorited(initialFavorited);
  }, [initialSaved, initialFavorited, announcementId]);

  const toggle = useCallback(
    async (type: StudentAnnouncementBookmarkType) => {
      if (pending) return;

      const prevSaved = saved;
      const prevFavorited = favorited;
      const nextSaved = type === 'SAVE' ? !saved : saved;
      const nextFavorited = type === 'FAVORITE' ? !favorited : favorited;

      setPending(type);
      setSaved(nextSaved);
      setFavorited(nextFavorited);

      try {
        const result = await studentAnnouncementsApi.toggleBookmark(announcementId, type);
        setSaved(result.isSaved);
        setFavorited(result.isFavorited);
        onBookmarkChange?.({ isSaved: result.isSaved, isFavorited: result.isFavorited });
      } catch {
        setSaved(prevSaved);
        setFavorited(prevFavorited);
      } finally {
        setPending(null);
      }
    },
    [announcementId, favorited, onBookmarkChange, pending, saved],
  );

  const handleSave = useCallback(() => {
    void toggle('SAVE');
  }, [toggle]);

  const handleFavorite = useCallback(() => {
    void toggle('FAVORITE');
  }, [toggle]);

  return (
    <div className="student-announcement-card__cover-actions-group">
      <button
        type="button"
        onClick={handleSave}
        disabled={pending === 'SAVE'}
        aria-pressed={saved}
        aria-label={t('student.announcements.actions.saveAria', { id: announcementId })}
        className={`admin-icon-btn admin-icon-btn--md student-announcement-card__action-btn !size-8 border-0${
          saved ? ' student-announcement-card__action-btn--active' : ''
        }`}
      >
        <Bookmark
          className={`size-[18px]${saved ? ' fill-current' : ''}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <button
        type="button"
        onClick={handleFavorite}
        disabled={pending === 'FAVORITE'}
        aria-pressed={favorited}
        aria-label={t('student.announcements.actions.favorAria', { id: announcementId })}
        className={`admin-icon-btn admin-icon-btn--md student-announcement-card__action-btn !size-8 border-0${
          favorited ? ' student-announcement-card__action-btn--active student-announcement-card__action-btn--favor' : ''
        }`}
      >
        <Heart
          className={`size-[18px]${favorited ? ' fill-current' : ''}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
    </div>
  );
};

export default AnnouncementCardActions;
