import { FunctionComponent, useCallback, useMemo, useState } from 'react';

import { Download, FilePlus2, MessageSquare, Sparkles } from 'lucide-react';

import { useTranslation } from 'react-i18next';

import { Navigate, useNavigate, useParams } from 'react-router-dom';

import BackButtonRow from '../../../../shared/navigation/BackButtonRow';

import { useBackNavigation } from '../../../../shared/navigation/useBackNavigation';

import StudentLayout from '../../components/StudentLayout';

import StudentSearchEmptyState from '../../ui/StudentSearchEmptyState';

import DocumentDetailMessageBanner from '../components/DocumentDetailMessageBanner';

import DocumentServiceDetailView from '../components/DocumentServiceDetailView';

import {

  DOCUMENT_DETAIL_PAGE_ROOT,

  STUDENT_DOCUMENTS_BACK_NAV_BUTTON,

} from '../constants/documentsLayout';

import { STUDENT_DOCUMENTS_CHAT_PATH, STUDENT_DOCUMENTS_PATH } from '../constants/routes';

import {

  DETAILS_OUTLINE_BUTTON,

  DETAILS_PRIMARY_BUTTON,

} from '../../internship_offers/constants/internshipOfferDetailsStyles';

import { useGenerateDocument } from '../hooks/useGenerateDocument';
import { useStudentDocumentDetail } from '../hooks/useStudentDocumentDetail';

import { useSubmitDocumentRequest } from '../hooks/useSubmitDocumentRequest';

import { buildDocumentServiceDetailViewModel } from '../utils/buildDocumentServiceDetailViewModel';

import '../../../admin/Documents_admin/styles/admin-documents.css';



const DocumentServiceDetailPage: FunctionComponent = () => {

  const { t } = useTranslation();

  const navigate = useNavigate();

  const { BackIcon, controlClassName } = useBackNavigation();

  const { id } = useParams<{ id: string }>();

  const { item, loading, error, refresh } = useStudentDocumentDetail(id);

  const { submitting, error: submitError, errorKind, submitRequest } = useSubmitDocumentRequest();
  const { generating, error: generateError, generateDocument } = useGenerateDocument();
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);

  const model = useMemo(() => (item ? buildDocumentServiceDetailViewModel(item, t) : null), [item, t]);

  const requestButtonLabel = useMemo(() => {
    if (submitting) return t('student.documents.requestSubmitting');
    if (item?.studentRequest?.isPending) return t('student.documents.requestStatus.alreadyPendingBtn');
    if (item?.studentRequest?.hasRequest && item.studentRequest.canRequestNew) {
      return t('student.documents.requestStatus.requestAgain');
    }
    return t('student.documents.requestBtn');
  }, [item, submitting, t]);



  const submitFeedbackVariant = errorKind === 'pending' ? 'warning' : 'danger';

  const submitFeedbackTitle =

    errorKind === 'pending'

      ? t('student.documents.feedback.pendingTitle')

      : t('student.documents.feedback.errorTitle');



  const goBack = useCallback(() => {

    navigate(STUDENT_DOCUMENTS_PATH);

  }, [navigate]);



  const handleAskQuestion = useCallback(() => {

    if (!id) return;

    navigate(`${STUDENT_DOCUMENTS_CHAT_PATH}?service=${id}`);

  }, [id, navigate]);



  const handleGenerate = useCallback(async () => {
    if (!id || !model?.canGenerate || generating) return;
    const result = await generateDocument(id);
    if (result) {
      setGenerateSuccess(result.reference);
      await refresh();
    }
  }, [generateDocument, generating, id, model?.canGenerate, refresh]);

  const handleRequest = useCallback(async () => {

    if (!id || !model || submitting) return;

    if (!model.requestOnline) {

      navigate(`${STUDENT_DOCUMENTS_CHAT_PATH}?service=${id}&intent=request`);

      return;

    }

    const result = await submitRequest(id);

    if (result) {

      navigate(STUDENT_DOCUMENTS_PATH, {

        replace: true,

        state: { requestSubmitted: true, reference: result.reference },

      });

    }

  }, [id, model, navigate, submitRequest, submitting]);



  if (!id) {

    return <Navigate to={STUDENT_DOCUMENTS_PATH} replace />;

  }



  const backButton = (
    <BackButtonRow className="student-document-detail-page__back">
      <button
        type="button"
        onClick={goBack}
        className={`${STUDENT_DOCUMENTS_BACK_NAV_BUTTON} ${controlClassName} group`}
      >
        <span className="student-back-nav-icon" aria-hidden>
          <BackIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={2} />
        </span>
        <span>{t('student.documents.backToCatalog')}</span>
      </button>
    </BackButtonRow>
  );

  return (
    <StudentLayout>
      <div id="student-document-detail-root" className={DOCUMENT_DETAIL_PAGE_ROOT}>
        {loading ? (
          <div className="student-document-detail-page__panel student-document-detail-page__panel--loading" aria-busy="true">
            {backButton}
            <div className="admin-doc-svc-card admin-doc-svc-card--skeleton min-h-[32rem]" />
          </div>
        ) : error || !item ? (
          <div className="student-document-detail-page__panel">
            {backButton}
            <div className="student-document-detail-page__empty">
              <StudentSearchEmptyState title={error ?? t('student.documents.detail.notFound')} />
            </div>
          </div>
        ) : (
          <article className="student-document-detail-page__panel">
            {backButton}
            <DocumentServiceDetailView item={item} />



            <footer className="student-document-detail-page__actions">

              {model?.isAutoGenerate ? (
                <DocumentDetailMessageBanner variant="info" compact icon={Sparkles} title={t('student.documents.generate.hintTitle')}>
                  {model.hasGeneratedOutput
                    ? t('student.documents.generate.readyHint', {
                        reference: item.studentRequest?.reference ?? generateSuccess ?? '—',
                      })
                    : t('student.documents.generate.actionHint')}
                </DocumentDetailMessageBanner>
              ) : null}

              {!model?.isAutoGenerate && item.studentRequest?.isPending ? (
                <DocumentDetailMessageBanner variant="warning" compact title={t('student.documents.feedback.pendingTitle')}>
                  {t('student.documents.requestStatus.detailPending', {
                    reference: item.studentRequest.reference ?? '—',
                  })}
                </DocumentDetailMessageBanner>
              ) : null}

              {!model?.isAutoGenerate && item.studentRequest?.hasRequest && !item.studentRequest.isPending ? (
                <DocumentDetailMessageBanner variant="info" compact title={t('student.documents.requestStatus.previousTitle')}>
                  {t('student.documents.requestStatus.detailPrevious', {
                    reference: item.studentRequest.reference ?? '—',
                    status: item.studentRequest.status
                      ? t(`student.documents.requestStatus.status.${item.studentRequest.status}`, item.studentRequest.status)
                      : '—',
                  })}
                </DocumentDetailMessageBanner>
              ) : null}

              {generateSuccess ? (
                <DocumentDetailMessageBanner variant="success" compact title={t('student.documents.generate.successTitle')}>
                  {t('student.documents.generate.successMessage', { reference: generateSuccess })}
                </DocumentDetailMessageBanner>
              ) : null}

              {generateError ? (
                <DocumentDetailMessageBanner variant="danger" compact title={t('student.documents.feedback.errorTitle')}>
                  {generateError}
                </DocumentDetailMessageBanner>
              ) : null}

              {submitError ? (

                <DocumentDetailMessageBanner

                  variant={submitFeedbackVariant}

                  title={submitFeedbackTitle}

                >

                  {submitError}

                </DocumentDetailMessageBanner>

              ) : null}

              <div className="student-document-detail-page__action-buttons">

                <button
                  type="button"
                  className={`${DETAILS_OUTLINE_BUTTON} inline-flex items-center justify-center gap-2`}
                  onClick={handleAskQuestion}
                >

                  <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />

                  <span className="safe-button-label">{t('student.documents.askQuestion')}</span>

                </button>

                {model?.isAutoGenerate ? (
                  model.hasGeneratedOutput && item.studentRequest?.generatedOutput?.fileUrl ? (
                    <button
                      type="button"
                      className={`${DETAILS_PRIMARY_BUTTON} inline-flex items-center justify-center gap-2`}
                      onClick={() => {
                        const output = item.studentRequest?.generatedOutput;
                        if (!output?.fileUrl) return;
                        const link = document.createElement('a');
                        link.href = output.fileUrl;
                        link.download = output.fileName ?? 'document';
                        link.target = '_blank';
                        link.rel = 'noreferrer';
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="safe-button-label">{t('student.documents.generate.downloadBtn')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${DETAILS_PRIMARY_BUTTON} inline-flex items-center justify-center gap-2`}
                      onClick={() => void handleGenerate()}
                      disabled={!model.canGenerate || generating}
                      aria-busy={generating}
                    >
                      <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="safe-button-label">
                        {generating ? t('student.documents.generate.generating') : t('student.documents.generate.btn')}
                      </span>
                    </button>
                  )
                ) : (
                  <button

                    type="button"

                    className={`${DETAILS_PRIMARY_BUTTON} inline-flex items-center justify-center gap-2`}

                    onClick={() => void handleRequest()}

                    disabled={!model?.canRequest || submitting}

                    aria-busy={submitting}

                  >

                    <FilePlus2 className="h-4 w-4 shrink-0" aria-hidden />

                    <span className="safe-button-label">{requestButtonLabel}</span>

                  </button>
                )}

              </div>

            </footer>

          </article>

        )}

      </div>

    </StudentLayout>

  );

};



export default DocumentServiceDetailPage;

