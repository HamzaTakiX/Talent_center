import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2 } from 'lucide-react';
import { cvAiBridge } from '../../quickcv/cvAiBridge';

const CvAiConfigBanner: FunctionComponent = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setMessage(
        cvAiBridge.phase === 'config_error' ? cvAiBridge.configMessage : null,
      );
    };
    sync();
    const unsub = cvAiBridge.subscribe(sync);
    return unsub;
  }, []);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="cv-ai-config-banner shrink-0 border-b px-4 py-2.5 sm:px-6"
          role="status"
        >
          <p className="mx-auto flex max-w-3xl items-start gap-2 text-center text-xs sm:text-left">
            <Settings2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>{t('cv.ai.config.title')}</strong> — {message}{' '}
              <span className="text-[var(--admin-text-secondary)]">
                {t('cv.ai.config.hint')}
              </span>
            </span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CvAiConfigBanner;
