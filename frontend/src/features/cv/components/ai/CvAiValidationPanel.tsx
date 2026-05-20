import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cvAiBridge } from '../../quickcv/cvAiBridge';
import { sectionLabelKey } from '../../utils/cvAiPresentation';

const CvAiValidationPanel: FunctionComponent = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [issues, setIssues] = useState(cvAiBridge.validationIssues);

  useEffect(() => {
    const sync = () => {
      setIssues([...cvAiBridge.validationIssues]);
      setOpen(cvAiBridge.phase === 'validation_failed' && cvAiBridge.validationIssues.length > 0);
    };
    sync();
    const unsub = cvAiBridge.subscribe(sync);
    return unsub;
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="cv-ai-validation pointer-events-auto fixed z-[57] inset-x-4 bottom-6 mx-auto max-w-[24rem] sm:inset-x-auto sm:right-8 sm:left-auto"
          role="alert"
        >
          <div className="cv-ai-validation__surface">
            <header className="cv-ai-validation__header">
              <div>
                <h2 className="cv-ai-validation__title">{t('cv.ai.validation.title')}</h2>
                <p className="cv-ai-validation__subtitle">{t('cv.ai.validation.subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cv-ai-cockpit__close"
                aria-label={t('common.close')}
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </header>
            <ul className="cv-ai-validation__list">
              {issues.map((issue, i) => (
                <motion.li
                  key={issue.code}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="cv-ai-validation__item"
                  data-section={issue.section}
                >
                  <span className="cv-ai-validation__dot" aria-hidden />
                  <div>
                    <span className="cv-ai-validation__section">
                      {t(sectionLabelKey(issue.section))}
                    </span>
                    <p className="cv-ai-validation__message">{t(issue.message_key)}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CvAiValidationPanel;
