import { useEffect, useState } from 'react';
import {
  buildAnnouncementDetailViewModel,
  collectAnnouncementUrlLinks,
  fileAttachmentsOnly,
  type AnnouncementAttachmentView,
  type AnnouncementUrlLinkView,
} from '../../../../admin/announcements-stage/utils/announcementDetailViewModel';
import { studentAnnouncementsApi } from '../../api/studentAnnouncementsApi';

export function useStudentAnnouncementAttachments(
  announcementId?: string,
  externalLinkLabel = 'Lien principal',
) {
  const [attachments, setAttachments] = useState<AnnouncementAttachmentView[]>([]);
  const [urlLinks, setUrlLinks] = useState<AnnouncementUrlLinkView[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = announcementId?.trim();
    if (!id) {
      setAttachments([]);
      setUrlLinks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void studentAnnouncementsApi
      .detail(id)
      .then((data) => {
        if (cancelled) return;
        const model = buildAnnouncementDetailViewModel(data);
        setAttachments(fileAttachmentsOnly(model.attachments));
        setUrlLinks(
          collectAnnouncementUrlLinks(model, externalLinkLabel),
        );
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
  }, [announcementId, externalLinkLabel]);

  return { attachments, urlLinks, loading };
}
