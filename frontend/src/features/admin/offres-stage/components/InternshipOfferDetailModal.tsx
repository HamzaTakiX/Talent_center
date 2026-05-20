import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdminEntityDetailModal from '../../ui/AdminEntityDetailModal';
import type { AdminDetailSection } from '../../ui/AdminDetailGrid';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import type { InternshipOffer } from '../types';

const FORM_PREFIX = 'admin.forms.createOffer';

interface InternshipOfferDetailModalProps {
  open: boolean;
  offer: InternshipOffer | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}

const InternshipOfferDetailModal: FunctionComponent<InternshipOfferDetailModalProps> = ({
  open,
  offer,
  onClose,
  onEdit,
}) => {
  const { t } = useTranslation();
  const { offerStatus } = useAdminTableValues();

  const sections: AdminDetailSection[] = useMemo(() => {
    if (!offer) return [];
    const statusLabel = offerStatus(offer.status);
    return [
      {
        sectionKey: 'overview',
        title: t('admin.common.detailModal.sections.overview'),
        fields: [
          { fieldKey: 'offerTitle', label: t(`${FORM_PREFIX}.fields.offerTitle`), value: offer.title },
          { fieldKey: 'company', label: t(`${FORM_PREFIX}.fields.company`), value: offer.company },
          { fieldKey: 'status', label: t('admin.tables.columns.status'), value: statusLabel },
          { fieldKey: 'deadline', label: t(`${FORM_PREFIX}.fields.deadline`), value: offer.deadline },
          {
            fieldKey: 'maxStudents',
            label: t('admin.common.detailModal.fields.applicants'),
            value: String(offer.applicants),
          },
        ],
      },
    ];
  }, [offer, t, offerStatus]);

  if (!offer) return null;

  return (
    <AdminEntityDetailModal
      open={open}
      onClose={onClose}
      title={t('admin.common.detailModal.offer.title')}
      description={offer.title}
      sections={sections}
      onEdit={() => onEdit(offer.id)}
    />
  );
};

export default InternshipOfferDetailModal;
