import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdminEntityDetailModal from '../../ui/AdminEntityDetailModal';
import type { AdminDetailSection } from '../../ui/AdminDetailGrid';
import type { AnnouncementRow } from '../types';

const FORM_PREFIX = 'admin.forms.createAnnouncement';

interface AnnouncementDetailModalProps {
  open: boolean;
  row: AnnouncementRow | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}

const AnnouncementDetailModal: FunctionComponent<AnnouncementDetailModalProps> = ({
  open,
  row,
  onClose,
  onEdit,
}) => {
  const { t } = useTranslation();

  const sections: AdminDetailSection[] = useMemo(() => {
    if (!row) return [];
    const typeKey = row.type.toLowerCase() as 'event' | 'interview' | 'info';
    const typeLabel = t(`admin.tables.filter.announcementTypes.${typeKey}`, { defaultValue: row.type });
    return [
      {
        sectionKey: 'overview',
        title: t('admin.common.detailModal.sections.overview'),
        fields: [
          { fieldKey: 'title', label: t(`${FORM_PREFIX}.fields.title`), value: row.title },
          { fieldKey: 'type', label: t(`${FORM_PREFIX}.fields.type`), value: typeLabel },
          { fieldKey: 'student', label: t(`${FORM_PREFIX}.fields.audience`), value: row.targetAudience },
          { fieldKey: 'eventDate', label: t(`${FORM_PREFIX}.fields.eventDate`), value: row.date },
        ],
      },
    ];
  }, [row, t]);

  if (!row) return null;

  return (
    <AdminEntityDetailModal
      open={open}
      onClose={onClose}
      title={t('admin.common.detailModal.announcement.title')}
      description={row.title}
      sections={sections}
      onEdit={() => onEdit(row.id)}
    />
  );
};

export default AnnouncementDetailModal;
