import { FunctionComponent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import InternshipAssistantBot from './InternshipAssistantBot';
import { useExternalApplyConfirmation } from '../context/ExternalApplyConfirmationContext';
import '../styles/internship-status-overlay.css';

const ExternalApplyConfirmationOverlay: FunctionComponent = () => {
  const { t } = useTranslation();
  const {
    isOpen,
    offerTitle,
    confirmApplied,
    declineApplied,
    submitting,
    readinessChecking,
    error,
    success,
  } = useExternalApplyConfirmation();

  const confirmDisabled = submitting || readinessChecking;

  if (!isOpen) return null;

  return (
    <div
      className="internship-status-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="external-apply-confirmation-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="internship-status-overlay__panel internship-status-overlay__panel--question"
      >
        <div className="internship-status-overlay__bubble internship-status-overlay__bubble--question">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h2 id="external-apply-confirmation-title" className="internship-status-overlay__title">
                  {t('student.internshipOffers.externalApply.questionTitle')}
                </h2>
                <p className="internship-status-overlay__subtitle">
                  {offerTitle
                    ? t('student.internshipOffers.externalApply.questionSubtitleNamed', {
                        offer: offerTitle,
                      })
                    : t('student.internshipOffers.externalApply.questionSubtitle')}
                </p>
                {error ? (
                  <p className="internship-status-overlay__error">
                    {t(
                      error === 'offer_not_applyable'
                        ? 'student.internshipOffers.externalApply.errorOfferNotAccepting'
                        : error === 'offer_expired'
                          ? 'student.internshipOffers.externalApply.errorOfferExpired'
                          : 'student.internshipOffers.externalApply.error',
                    )}
                  </p>
                ) : null}
                <div className="internship-status-overlay__choices">
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary admin-btn--sm"
                    disabled={confirmDisabled}
                    onClick={() => void confirmApplied()}
                  >
                    {confirmDisabled
                      ? t('student.common.loading')
                      : t('student.internshipOffers.externalApply.yes')}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn--sm"
                    disabled={confirmDisabled}
                    onClick={declineApplied}
                  >
                    {t('student.internshipOffers.externalApply.no')}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="internship-status-overlay__success"
              >
                <h2 id="external-apply-confirmation-title" className="internship-status-overlay__title">
                  {t('student.internshipOffers.externalApply.successTitle')}
                </h2>
                <p className="internship-status-overlay__subtitle">
                  {t('student.internshipOffers.externalApply.successSubtitle')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="internship-status-overlay__bot-wrap internship-status-overlay__bot-wrap--overflow">
          <div className="internship-status-overlay__bot-glow" aria-hidden="true" />
          <InternshipAssistantBot
            className="internship-status-overlay__bot"
            greeting={t('student.internshipOffers.externalApply.botGreeting')}
            animated
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ExternalApplyConfirmationOverlay;
