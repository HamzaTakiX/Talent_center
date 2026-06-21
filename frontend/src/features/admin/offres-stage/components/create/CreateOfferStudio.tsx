import { FunctionComponent, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useNavigate, useSearchParams } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';

import { ArrowRight, CheckCircle, Pencil, Save, ShieldCheck } from 'lucide-react';

import BackButtonRow from '../../../../../shared/navigation/BackButtonRow';
import { useBackNavigation } from '../../../../../shared/navigation/useBackNavigation';

import { stageApi } from '../../../../shared/api/stageApi';

import { mapCreateOfferFormToPayload } from '../../../../shared/utils/stageMappers';

import { parseAdminApiError } from '../../../shared/utils/parseAdminApiError';

import { useAdminToast } from '../../../dashboard/context/AdminToastContext';

import {
  useCreateOfferWorkflow,
  type OfferStudioOptions,
} from '../../hooks/useCreateOfferWorkflow';

import { isReadyToPublish } from './reviewOfferHelpers';

import { OFFER_STUDIO_BTN_PRIMARY, OFFER_STUDIO_BTN_SECONDARY } from './offerStudioClasses';

import CreateOfferHeader from './CreateOfferHeader';

import OfferStudioActionButton, { type OfferSubmitAction } from './OfferStudioActionButton';

import CreationMethodSelection from './CreationMethodSelection';

import CreateOfferStepper from './CreateOfferStepper';

import CreateOfferPreviewPanel from './CreateOfferPreviewPanel';

import ImportFromUrlWorkspace from './ImportFromUrlWorkspace';

import DuplicateDetectionBanner from './DuplicateDetectionBanner';

import SuggestedStudentsPanel from './SuggestedStudentsPanel';

import StepBasicInfo from './steps/StepBasicInfo';

import StepDescription from './steps/StepDescription';

import StepSkills from './steps/StepSkills';

import StepTargeting from './steps/StepTargeting';

import StepRecruitment from './steps/StepRecruitment';

import StepReview from './steps/StepReview';



const PREFIX = 'admin.forms.createOfferStudio';



interface CreateOfferStudioProps extends OfferStudioOptions {
  onBack: () => void;
}



const CreateOfferStudio: FunctionComponent<CreateOfferStudioProps> = ({
  onBack,
  mode = 'create',
  offerId,
  initialForm,
  offerStatus,
  lastUpdatedAt,
}) => {

  const { t } = useTranslation();
  const { BackIcon, controlClassName } = useBackNavigation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const importMode = mode === 'create' && searchParams.get('mode') === 'import';

  const workflow = useCreateOfferWorkflow(importMode ? 'import' : null, {
    mode,
    offerId,
    initialForm,
    offerStatus,
    lastUpdatedAt,
  });

  const toast = useAdminToast();

  const [submitting, setSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<OfferSubmitAction>(null);

  const editMeta = useMemo(() => {
    if (!workflow.isEditMode) return undefined;
    return {
      status: offerStatus ?? 'Draft',
      lastUpdatedAt: workflow.lastSavedAt,
    };
  }, [offerStatus, workflow.isEditMode, workflow.lastSavedAt]);



  const submitManualOffer = async (publish: boolean) => {

    const payload = mapCreateOfferFormToPayload(workflow.form);

    if (workflow.isEditMode && offerId) {

      await stageApi.update(offerId, payload);

      if (publish) {

        await stageApi.action(offerId, 'publish');

        toast.success(t(`${PREFIX}.messages.publishSuccess`));

      } else {

        toast.success(t(`${PREFIX}.messages.changesSaved`));

      }

      navigate('/admin/internship-offers');

      return;

    }



    const created = await stageApi.create(payload);

    if (publish) {

      await stageApi.action(created.uuid, 'publish');

      toast.success(t(`${PREFIX}.messages.publishSuccess`));

    } else {

      toast.success(t(`${PREFIX}.messages.draftSaved`));

    }

    navigate('/admin/internship-offers');

  };



  const submitOffer = async (publish: boolean) => {

    workflow.setValidationAttempted(true);



    if (!workflow.form.title.trim()) {

      toast.warning(t(`${PREFIX}.messages.missingTitle`));

      return;

    }



    if (publish && !isReadyToPublish(workflow.form)) {

      toast.warning(t(`${PREFIX}.messages.incompleteOffer`));

      if (workflow.method !== 'import') {
        workflow.setCurrentStep('review');
      }

      return;

    }



    if (!workflow.isEditMode && workflow.duplicate && !workflow.duplicateDismissed) {

      toast.warning(t(`${PREFIX}.messages.duplicateBlocked`));

      return;

    }



    setSubmitting(true);
    setSubmitAction(publish ? 'publish' : 'draft');

    try {

      if (workflow.isEditMode) {

        await submitManualOffer(publish);

        return;

      }



      if (workflow.method === 'import' && workflow.importJobMeta?.jobUuid) {

        const result = await workflow.submitImport(publish);

        toast.success(

          publish ? t(`${PREFIX}.messages.publishSuccess`) : t(`${PREFIX}.messages.draftSaved`),

        );

        navigate(`/admin/internship-offers/${result.offer_uuid}`);

        return;

      }



      await submitManualOffer(publish);

    } catch (err) {

      toast.error(parseAdminApiError(err, publish ? 'publish_failed' : 'draft_save_failed').message);

    } finally {

      setSubmitting(false);
      setSubmitAction(null);

    }

  };



  const handlePublish = () => void submitOffer(true);

  const handleSaveDraft = async () => {

    if (workflow.isEditMode) {

      setSubmitAction('draft');
      setSubmitting(true);

      try {

        await workflow.saveDraft();

        toast.success(t(`${PREFIX}.messages.changesSaved`));

      } catch (err) {

        toast.error(parseAdminApiError(err, 'draft_save_failed').message);

      } finally {

        setSubmitting(false);
        setSubmitAction(null);

      }

      return;

    }

    if (workflow.method !== 'import' && isReadyToPublish(workflow.form)) {

      toast.warning(t(`${PREFIX}.messages.completeOfferUsePublish`));

      return;

    }

    void submitOffer(false);

  };



  const renderWizardStep = () => {

    switch (workflow.currentStep) {

      case 'basic':

        return <StepBasicInfo form={workflow.form} onChange={workflow.updateForm} />;

      case 'description':

        return (

          <StepDescription

            form={workflow.form}

            onChange={(description) => workflow.updateForm({ description })}

          />

        );

      case 'skills':

        return <StepSkills form={workflow.form} onChange={workflow.updateForm} />;

      case 'targeting':

        return (

          <StepTargeting

            form={workflow.form}

            audienceSize={workflow.audienceSize}

            audiencePreviewLoading={workflow.audiencePreviewLoading}

            hasTargeting={workflow.hasTargeting}

            onChange={(targeting) => workflow.updateForm({ targeting })}

          />

        );

      case 'recruitment':

        return (

          <StepRecruitment

            form={workflow.form}

            onChange={(recruitment) => workflow.updateForm({ recruitment })}

          />

        );

      case 'review':

        return (

          <StepReview

            form={workflow.form}

            analytics={workflow.analytics}

            hasTargeting={workflow.hasTargeting}

            onNavigateToStep={workflow.setCurrentStep}

            editMeta={editMeta}

          />

        );

      default:

        return null;

    }

  };



  const stepTitleKey = `${PREFIX}.steps.${workflow.currentStep}`;

  const stepDescKey = `${PREFIX}.stepDesc.${workflow.currentStep}`;

  const isBusy = submitting || workflow.saveStatus === 'saving';

  const importCanPublish = useMemo(
    () => workflow.importPhase === 'extracted' && isReadyToPublish(workflow.form),
    [workflow.form, workflow.importPhase],
  );

  const formIsComplete = useMemo(() => isReadyToPublish(workflow.form), [workflow.form]);

  const publishDisabled = useMemo(() => {
    if (isBusy) return true;
    if (workflow.method === 'import') {
      return workflow.importPhase !== 'extracted' || !importCanPublish;
    }
    return !workflow.form.title.trim();
  }, [importCanPublish, isBusy, workflow.form.title, workflow.importPhase, workflow.method]);

  const saveDraftDisabled = useMemo(() => {
    if (isBusy) return true;
    if (workflow.isEditMode) return false;
    if (workflow.method === 'import') {
      return workflow.importPhase !== 'extracted';
    }
    return formIsComplete;
  }, [formIsComplete, isBusy, workflow.importPhase, workflow.isEditMode, workflow.method]);



  return (

    <div className={`offer-studio-page ${!workflow.method && !workflow.isEditMode ? 'offer-studio-page--method-select' : ''}`}>

      {(workflow.method || workflow.isEditMode) && (

      <BackButtonRow>

      <button

        type="button"

        onClick={onBack}

        className={`${OFFER_STUDIO_BTN_SECONDARY} ${controlClassName} h-9 w-fit`}

      >

        <BackIcon className="h-4 w-4" aria-hidden />

        {t('admin.back.offers')}

      </button>

      </BackButtonRow>

      )}



      {(workflow.method || workflow.isEditMode) && (

      <CreateOfferHeader

        mode={mode}

        onSaveDraft={() => void handleSaveDraft()}

        onPublish={handlePublish}

        publishDisabled={publishDisabled}

        saveDraftDisabled={saveDraftDisabled}

        saveStatus={workflow.saveStatus}

        lastSavedAt={workflow.lastSavedAt}

        hasUnsavedChanges={workflow.hasUnsavedChanges}

        saveError={workflow.saveError}

        submitAction={submitAction}

      />

      )}

      <div
        className={`offer-studio__layout ${
          workflow.currentStep === 'review' && workflow.method === 'manual'
            ? 'offer-studio__layout--review'
            : ''
        } ${workflow.method === 'import' ? 'offer-studio__layout--import' : ''} ${
          !workflow.method && !workflow.isEditMode ? 'offer-studio__layout--method-select' : ''
        }`}
      >

        <div className="offer-studio-workspace">

          {!workflow.method && !workflow.isEditMode && (

            <CreationMethodSelection

              selected={workflow.method}

              onSelect={workflow.setMethod}

              onBack={onBack}

            />

          )}



          {workflow.method === 'import' && (

            <>

              <ImportFromUrlWorkspace

                importUrl={workflow.importUrl}

                onUrlChange={workflow.setImportUrl}

                importPhase={workflow.importPhase}

                importMessageIndex={workflow.importMessageIndex}

                importError={workflow.importError}

                importJobMeta={workflow.importJobMeta}

                form={workflow.form}

                onFormChange={workflow.updateForm}

                onAnalyze={workflow.analyzeImport}

                onRetry={() => {

                  void workflow.analyzeImport();

                }}

                onTryAnotherUrl={workflow.resetImportForNewUrl}

                validationAttempted={workflow.validationAttempted}

                hasTargeting={workflow.hasTargeting}

                audienceSize={workflow.audienceSize}

                audiencePreviewLoading={workflow.audiencePreviewLoading}

              />

              {workflow.duplicate && !workflow.duplicateDismissed && workflow.importPhase === 'extracted' && (

                <DuplicateDetectionBanner

                  duplicate={workflow.duplicate}

                  onViewExisting={() => navigate(`/admin/internship-offers/${workflow.duplicate!.id}`)}

                  onContinue={() => workflow.setDuplicateDismissed(true)}

                />

              )}

              {workflow.importPhase === 'extracted' && (

                <div className="offer-studio-footer">

                  <button type="button" className={OFFER_STUDIO_BTN_SECONDARY} onClick={() => workflow.setMethod(null)} disabled={isBusy}>

                    {t(`${PREFIX}.actions.changeMethod`)}

                  </button>

                  <OfferStudioActionButton

                    icon={Save}

                    loading={submitAction === 'draft'}

                    loadingLabel={t(`${PREFIX}.actions.savingDraft`)}

                    disabled={saveDraftDisabled}

                    onClick={() => void handleSaveDraft()}

                  >

                    {t(`${PREFIX}.actions.saveDraft`)}

                  </OfferStudioActionButton>

                  <OfferStudioActionButton

                    variant="primary"

                    icon={CheckCircle}

                    loading={submitAction === 'publish'}

                    loadingLabel={t(`${PREFIX}.actions.publishing`)}

                    disabled={publishDisabled}

                    onClick={handlePublish}

                  >

                    {t(`${PREFIX}.actions.publish`)}

                  </OfferStudioActionButton>

                </div>

              )}

            </>

          )}



          {workflow.method === 'manual' && (

            <>

              <div className="offer-studio-progress-header">

                <CreateOfferStepper

                  currentStep={workflow.currentStep}

                  form={workflow.form}

                  validationAttempted={workflow.validationAttempted}

                  isEditMode={workflow.isEditMode}

                  onSelect={workflow.setCurrentStep}

                />

              </div>



              {!workflow.isEditMode && workflow.duplicate && !workflow.duplicateDismissed && (

                <DuplicateDetectionBanner

                  duplicate={workflow.duplicate}

                  onViewExisting={() => navigate(`/admin/internship-offers/${workflow.duplicate!.id}`)}

                  onContinue={() => workflow.setDuplicateDismissed(true)}

                />

              )}



              <div className={`offer-studio-panel ${workflow.currentStep === 'review' ? 'offer-studio-panel--review' : ''}`}>

                <div className="offer-studio-panel__head">

                  <h2 className="offer-studio-panel__title">{t(stepTitleKey)}</h2>

                  <p className="offer-studio-panel__desc">{t(stepDescKey)}</p>

                </div>

                <div className="offer-studio-panel__body admin-form offer-studio-form">

                  <AnimatePresence mode="wait">

                    <motion.div

                      key={workflow.currentStep}

                      initial={{ opacity: 0, x: 12 }}

                      animate={{ opacity: 1, x: 0 }}

                      exit={{ opacity: 0, x: -12 }}

                      transition={{ duration: 0.25 }}

                    >

                      {renderWizardStep()}

                    </motion.div>

                  </AnimatePresence>

                </div>

              </div>



              {(workflow.currentStep === 'targeting') && (

                <SuggestedStudentsPanel students={workflow.suggestedStudents} />

              )}



              {workflow.currentStep === 'review' ? (

                <div className="offer-review-publish-bar">

                  <button

                    type="button"

                    className={OFFER_STUDIO_BTN_SECONDARY}

                    disabled={isBusy}

                    onClick={() => workflow.setCurrentStep('recruitment')}

                  >

                    <Pencil className="h-4 w-4" aria-hidden />

                    {t(`${PREFIX}.actions.backToEdit`)}

                  </button>

                  <div className="offer-review-publish-bar__actions">

                    <OfferStudioActionButton

                      icon={Save}

                      loading={submitAction === 'draft'}

                      loadingLabel={t(`${PREFIX}.actions.savingDraft`)}

                      disabled={saveDraftDisabled}

                      onClick={() => void handleSaveDraft()}

                    >

                      {t(workflow.isEditMode ? `${PREFIX}.actions.saveChanges` : `${PREFIX}.actions.saveDraft`)}

                    </OfferStudioActionButton>

                    <OfferStudioActionButton

                      variant="primary"

                      icon={ShieldCheck}

                      loading={submitAction === 'publish'}

                      loadingLabel={t(`${PREFIX}.actions.publishing`)}

                      disabled={!workflow.form.title.trim() || isBusy}

                      onClick={handlePublish}

                    >

                      {t(workflow.isEditMode ? `${PREFIX}.actions.republish` : `${PREFIX}.actions.publish`)}

                    </OfferStudioActionButton>

                  </div>

                </div>

              ) : (

              <div className="offer-studio-footer">

                <button

                  type="button"

                  className={OFFER_STUDIO_BTN_SECONDARY}

                  onClick={

                    workflow.wizardStepIndex === 0

                      ? workflow.isEditMode

                        ? onBack

                        : () => workflow.setMethod(null)

                      : workflow.goPrev

                  }

                >

                  {workflow.wizardStepIndex === 0

                    ? workflow.isEditMode

                      ? t('admin.back.offers')

                      : t(`${PREFIX}.actions.changeMethod`)

                    : t(`${PREFIX}.actions.previous`)}

                </button>

                <button type="button" className={OFFER_STUDIO_BTN_PRIMARY} onClick={workflow.goNext}>

                  {t(`${PREFIX}.actions.next`)}

                  <ArrowRight className="h-4 w-4" aria-hidden />

                </button>

              </div>

              )}

            </>

          )}

        </div>



        {(workflow.method === 'import' ||
          (workflow.method === 'manual' && workflow.currentStep !== 'review')) && (

        <div className="offer-studio__preview-col">

          <CreateOfferPreviewPanel

            form={workflow.form}

            analytics={workflow.analytics}

            insights={workflow.insights}

            audienceSize={workflow.audienceSize}

            hasTargeting={workflow.hasTargeting}

            canPreviewMatchScore={workflow.canPreviewMatchScore}

          />

        </div>

        )}

      </div>

    </div>

  );

};



export default CreateOfferStudio;
