import { FunctionComponent, useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { stageApi } from '../../../../shared/api/stageApi';
import { mapStageDetailToCreateOfferForm } from '../../../../shared/utils/stageMappers';
import AdminModal from '../../../ui/AdminModal';
import {
  buildSectionStatuses,
  computeReadinessScore,
} from '../../components/create/reviewOfferHelpers';
import { createEmptyOfferForm } from '../../types/createOfferWorkflow';
import { parseStageActionError } from '../../utils/parseStageActionError';

const PREFIX = 'admin.modules.offers.draftsPage.publish';
const REVIEW_PREFIX = 'admin.forms.createOfferStudio.review.validationCenter';
const COMPLETION_PREFIX = 'admin.forms.createOfferStudio.review.completion';

interface DraftOfferPublishModalProps {
  open: boolean;
  offerId: string | null;
  offerTitle?: string;
  onClose: () => void;
  onPublished: () => void | Promise<void>;
  onCompleteOffer: (offerId: string) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

const DraftOfferPublishModal: FunctionComponent<DraftOfferPublishModalProps> = ({
  open,
  offerId,
  offerTitle,
  onClose,
  onPublished,
  onCompleteOffer,
  onError,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [score, setScore] = useState(0);
  const [ready, setReady] = useState(false);
  const [sections, setSections] = useState(buildSectionStatuses(createEmptyOfferForm()));

  useEffect(() => {
    if (!open || !offerId) return;

    let cancelled = false;
    setLoading(true);

    void stageApi
      .detail(offerId)
      .then((detail) => {
        if (cancelled) return;
        const form = mapStageDetailToCreateOfferForm(detail);
        const statuses = buildSectionStatuses(form);
        setSections(statuses);
        setScore(computeReadinessScore(form));
        setReady(computeReadinessScore(form) === 100);
      })
      .catch((err) => {
        if (!cancelled) {
          onError(parseStageActionError(err, `${PREFIX}.errors.loadFailed`));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, offerId, onError]);

  const handlePublish = async () => {
    if (!offerId || !ready) return;
    setPublishing(true);
    try {
      await stageApi.action(offerId, 'publish');
      onSuccess(t(`${PREFIX}.success`));
      await onPublished();
      onClose();
    } catch (err) {
      onError(parseStageActionError(err, `${PREFIX}.errors.failed`));
    } finally {
      setPublishing(false);
    }
  };

  const incompleteSections = sections.filter((section) => !section.complete);

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t(`${PREFIX}.title`)}
      description={
        offerTitle
          ? t(`${PREFIX}.subtitle`, { title: offerTitle })
          : undefined
      }
      maxWidthClass="max-w-lg"
      closeAriaLabel={t('common.close')}
      footer={
        <div className="flex w-full flex-wrap justify-end gap-2">
          <button
            type="button"
            className="admin-module-toolbar__btn"
            onClick={onClose}
            disabled={publishing}
          >
            {t('common.cancel')}
          </button>
          {!ready && offerId ? (
            <button
              type="button"
              className="admin-table-btn admin-table-btn--primary min-w-[140px]"
              onClick={() => {
                onCompleteOffer(offerId);
                onClose();
              }}
              disabled={loading || publishing}
            >
              {t(`${PREFIX}.completeOffer`)}
            </button>
          ) : (
            <button
              type="button"
              className="admin-table-btn admin-table-btn--success min-w-[140px]"
              onClick={() => void handlePublish()}
              disabled={loading || publishing || !ready}
            >
              {publishing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                t(`${PREFIX}.confirm`)
              )}
            </button>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-[var(--admin-text-secondary)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {t(`${PREFIX}.checking`)}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-4">
            <p className="text-sm text-[var(--admin-text-secondary)]">
              {t(`${REVIEW_PREFIX}.percentComplete`, { percent: score })}
            </p>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--admin-border)]"
              role="progressbar"
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t(`${REVIEW_PREFIX}.percentComplete`, { percent: score })}
            >
              <div
                className="h-full rounded-full bg-[var(--admin-brand)] transition-all"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-[var(--admin-text)]">
              {ready
                ? t(`${PREFIX}.allComplete`)
                : t(`${REVIEW_PREFIX}.missingSections`)}
            </p>
            <ul className="space-y-2">
              {sections.map((section) => {
                const label = section.complete
                  ? t(`${COMPLETION_PREFIX}.sections.${section.id}`)
                  : section.missingLabelKey
                    ? t(`${COMPLETION_PREFIX}.missing.${section.missingLabelKey}`)
                    : t(`${COMPLETION_PREFIX}.sections.${section.id}`);
                return (
                  <li
                    key={section.id}
                    className="flex items-start gap-2 text-sm text-[var(--admin-text)]"
                  >
                    {section.complete ? (
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-success)]"
                        aria-hidden
                      />
                    ) : (
                      <Circle
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-danger)]"
                        aria-hidden
                      />
                    )}
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {!ready && incompleteSections.length > 0 ? (
            <p className="text-sm text-[var(--admin-text-secondary)]">
              {t(`${PREFIX}.blockedHint`)}
            </p>
          ) : null}
        </div>
      )}
    </AdminModal>
  );
};

export default DraftOfferPublishModal;
