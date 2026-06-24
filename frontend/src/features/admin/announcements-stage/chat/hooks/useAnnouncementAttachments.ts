import { useEffect, useState } from 'react';
import { adminAnnouncementsApi } from '../../../api/announcements';
import {
  buildAnnouncementDetailViewModel,
  collectAnnouncementUrlLinks,
  fileAttachmentsOnly,
  type AnnouncementAttachmentView,
  type AnnouncementUrlLinkView,
} from '../../utils/announcementDetailViewModel';

export function useAnnouncementAttachments(announcementUuid?: string) {
  const [attachments, setAttachments] = useState<AnnouncementAttachmentView[]>([]);
  const [urlLinks, setUrlLinks] = useState<AnnouncementUrlLinkView[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = announcementUuid?.trim();
    if (!id) {
      setAttachments([]);
      setUrlLinks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void adminAnnouncementsApi
      .detail(id)
      .then((data) => {
        if (cancelled) return;
        const model = buildAnnouncementDetailViewModel(data);
        setAttachments(fileAttachmentsOnly(model.attachments));
        setUrlLinks(collectAnnouncementUrlLinks(model));
      })
      .catch(() => {
        if (!cancelled) {
          setAttachments([]);
          setUrlLinks([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [announcementUuid]);

  return { attachments, urlLinks, loading };
}
