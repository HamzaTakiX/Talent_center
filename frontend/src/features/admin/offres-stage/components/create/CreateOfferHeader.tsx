import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Clock3, FileText, Loader2, Rocket } from 'lucide-react';
import type { SaveStatus } from '../../hooks/useCreateOfferWorkflow';
import { formatReviewDate } from './reviewOfferHelpers';
import OfferStudioActionButton, { type OfferSubmitAction } from './OfferStudioActionButton';

const PREFIX = 'admin.forms.createOfferStudio';

interface CreateOfferHeaderProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  publishDisabled?: boolean;
  saveDraftDisabled?: boolean;
  mode?: 'create' | 'edit';
  saveStatus?: SaveStatus;
  lastSavedAt?: string | null;
  hasUnsavedChanges?: boolean;
  saveError?: string | null;
  submitAction?: OfferSubmitAction;
}

const CreateOfferHeader: FunctionComponent<CreateOfferHeaderProps> = ({
  onSaveDraft,
  onPublish,
  publishDisabled,
  saveDraftDisabled,
  mode = 'create',
  saveStatus = 'idle',
  lastSavedAt,
  hasUnsavedChanges = false,
  saveError,
  submitAction = null,
}) => {
  const { t, i18n } = useTranslation();
  const isEditMode = mode === 'edit';
  const draftLoading = submitAction === 'draft' || (isEditMode && saveStatus === 'saving');
  const publishLoading = submitAction === 'publish';
  const locale = i18n.language || 'fr';

  const saveStatusLabel = useMemo(() => {
    if (saveStatus === 'saving') return t(`${PREFIX}.saveStatus.saving`);
    if (saveStatus === 'saved') return t(`${PREFIX}.saveStatus.saved`);
    if (saveStatus === 'error') return saveError ?? t(`${PREFIX}.saveStatus.error`);
    if (hasUnsavedChanges) return t(`${PREFIX}.saveStatus.unsaved`);
    if (lastSavedAt) {
      return t(`${PREFIX}.saveStatus.lastSaved`, {
        time: formatReviewDate(lastSavedAt, locale, lastSavedAt),
      });
    }
    return t(`${PREFIX}.saveStatus.idle`);
  }, [hasUnsavedChanges, lastSavedAt, locale, saveError, saveStatus, t]);

  const saveStatusIcon = useMemo(() => {
    if (saveStatus === 'saving') return Loader2;
    if (saveStatus === 'saved') return CheckCircle2;
    if (saveStatus === 'error') return AlertCircle;
    if (hasUnsavedChanges) return Clock3;
    return Clock3;
  }, [hasUnsavedChanges, saveStatus]);

  const SaveStatusIcon = saveStatusIcon;

  return (
    <header className="offer-studio-hero">
      <div className="offer-studio-hero__glow" aria-hidden />
      <div className="offer-studio-hero__inner">
        <div>
          <h1 className="offer-studio-hero__title">
            {t(isEditMode ? `${PREFIX}.editTitle` : `${PREFIX}.title`)}
          </h1>
          <p className="offer-studio-hero__subtitle">
            {t(isEditMode ? `${PREFIX}.editSubtitle` : `${PREFIX}.subtitle`)}
          </p>
          {isEditMode && (
            <div
              className={`offer-studio-save-status offer-studio-save-status--${saveStatus}${hasUnsavedChanges ? ' offer-studio-save-status--unsaved' : ''}`}
              aria-live="polite"
            >
              <SaveStatusIcon
                className={`h-3.5 w-3.5 shrink-0 ${saveStatus === 'saving' ? 'animate-spin' : ''}`}
                aria-hidden
              />
              <span>{saveStatusLabel}</span>
            </div>
          )}
        </div>
        <div className="offer-studio-hero__actions">
          <OfferStudioActionButton
            icon={FileText}
            loading={draftLoading}
            loadingLabel={t(`${PREFIX}.actions.savingDraft`)}
            disabled={saveDraftDisabled || (saveStatus === 'saving' && submitAction !== 'draft')}
            onClick={onSaveDraft}
          >
            {t(isEditMode ? `${PREFIX}.actions.saveChanges` : `${PREFIX}.actions.saveDraft`)}
          </OfferStudioActionButton>
          <OfferStudioActionButton
            variant="primary"
            icon={Rocket}
            loading={publishLoading}
            loadingLabel={t(`${PREFIX}.actions.publishing`)}
            disabled={publishDisabled || saveStatus === 'saving'}
            onClick={onPublish}
          >
            {t(isEditMode ? `${PREFIX}.actions.republish` : `${PREFIX}.actions.publish`)}
          </OfferStudioActionButton>
        </div>
      </div>
    </header>
  );
};

export default CreateOfferHeader;
