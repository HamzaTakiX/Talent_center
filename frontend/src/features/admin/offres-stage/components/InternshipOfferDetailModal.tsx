import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Eye, Loader2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminModal from '../../ui/AdminModal';
import {
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
} from '../../shared/forms/adminFormClasses';
import { stageApi } from '../../../shared/api/stageApi';
import type { StageApplication, StageOfferDetail } from '../../../shared/types/stageTypes';
import type { InternshipOffer } from '../types';
import {
  buildOfferDetailViewModel,
  type OfferDetailNavSection,
} from '../utils/offerDetailViewModel';
import { parseAdminApiError } from '../../shared/utils/parseAdminApiError';
import {
  InternshipOfferDetailSections,
  InternshipOfferDetailHeaderMeta,
} from './detail/InternshipOfferDetailSections';
import '../styles/offer-detail-modal.css';

const PREFIX = 'admin.modules.offers.viewDetail';

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
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const bodyRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<StageOfferDetail | null>(null);
  const [applications, setApplications] = useState<StageApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<OfferDetailNavSection>('overview');

  useEffect(() => {
    if (!open || !offer?.id) {
      setDetail(null);
      setApplications([]);
      setError(null);
      setActiveSection('overview');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([stageApi.detail(offer.id), stageApi.applications(offer.id)])
      .then(([offerDetail, apps]) => {
        if (cancelled) return;
        setDetail(offerDetail);
        setApplications(apps);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(parseAdminApiError(err, 'offer_not_found').message);
        setDetail(null);
        setApplications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, offer?.id]);

  const viewModel = useMemo(
    () => (detail ? buildOfferDetailViewModel(detail, applications) : null),
    [detail, applications],
  );

  const scrollToSection = useCallback((section: OfferDetailNavSection) => {
    setActiveSection(section);
    const el = document.getElementById(`offer-detail-${section}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const footer = (
    <>
      <button type="button" className={adminFormBtnSecondaryClass} onClick={onClose}>
        {t('admin.common.detailModal.close')}
      </button>
      {offer ? (
        <button
          type="button"
          className={adminFormBtnPrimaryClass}
          onClick={() => {
            onClose();
            onEdit(offer.id);
          }}
        >
          <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t('admin.common.actions.edit')}
        </button>
      ) : null}
    </>
  );

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t('admin.common.detailModal.offer.title')}
      description={offer?.title}
      footer={footer}
      maxWidthClass="admin-modal--offer-detail"
      dir={isRtl ? 'rtl' : 'ltr'}
      closeAriaLabel={t('admin.common.detailModal.close')}
    >
      <div ref={bodyRef} className="offer-detail-modal__layout">
        <div className="offer-detail-modal__banner">
          <span className="offer-detail-modal__banner-icon" aria-hidden>
            <Eye className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <p className="offer-detail-modal__banner-text">{t('admin.common.detailModal.readOnlyHint')}</p>
        </div>

        {loading ? (
          <div className="offer-detail-modal__loading" role="status">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" aria-hidden />
            {t(`${PREFIX}.loading`)}
          </div>
        ) : error ? (
          <p className="offer-detail-modal__error" role="alert">
            {error}
          </p>
        ) : viewModel ? (
          <>
            <InternshipOfferDetailHeaderMeta viewModel={viewModel} />
            <InternshipOfferDetailSections
              viewModel={viewModel}
              activeSection={activeSection}
              onSectionChange={scrollToSection}
            />
          </>
        ) : null}
      </div>
    </AdminModal>
  );
};

export default InternshipOfferDetailModal;
