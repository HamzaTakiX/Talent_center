import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertCircle, FileUp, RefreshCw, Sparkles } from 'lucide-react';

interface CvAnalysisSkeletonProps {
  className?: string;
}

export const CvAnalysisSkeleton: FunctionComponent<CvAnalysisSkeletonProps> = ({ className = '' }) => (
  <div className={`sr-cva__root sr-cva ${className}`}>
    <div className="sr-cva-glass sr-cva-glass--hero" style={{ minHeight: 180 }}>
      <div className="sr-cva-skeleton" style={{ height: 24, width: '40%', marginBottom: 12 }} />
      <div className="sr-cva-skeleton" style={{ height: 16, width: '60%' }} />
    </div>
    <div className="sr-cva__grid">
      <div className="sr-cva-glass" style={{ height: 320 }}>
        <div className="sr-cva-skeleton" style={{ height: 16, width: '70%', margin: 16 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sr-cva-skeleton" style={{ height: 36, margin: '8px 16px' }} />
        ))}
      </div>
      <div className="sr-cva__main" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="sr-cva-glass sr-cva-skeleton" style={{ height: 160 }} />
        <div className="sr-cva-breakdown-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sr-cva-glass sr-cva-skeleton" style={{ height: 100 }} />
          ))}
        </div>
        <div className="sr-cva-glass sr-cva-skeleton" style={{ height: 240 }} />
      </div>
    </div>
  </div>
);

interface CvAnalysisEmptyStateProps {
  onUpload: () => void;
}

export const CvAnalysisEmptyState: FunctionComponent<CvAnalysisEmptyStateProps> = ({ onUpload }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="sr-cva-glass sr-cva-state"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="sr-cva-state__icon">
        <FileUp className="h-8 w-8" aria-hidden />
      </div>
      <h2 className="sr-cva-state__title">{t('student.internshipOffers.cvDashboard.empty.title')}</h2>
      <p className="sr-cva-state__desc">{t('student.internshipOffers.cvDashboard.empty.desc')}</p>
      <button type="button" className="sr-cva-btn sr-cva-btn--primary" onClick={onUpload}>
        <Sparkles className="h-4 w-4" aria-hidden />
        {t('student.internshipOffers.cvDashboard.empty.upload')}
      </button>
    </motion.div>
  );
};

interface CvAnalysisErrorStateProps {
  onRetry: () => void;
}

export const CvAnalysisErrorState: FunctionComponent<CvAnalysisErrorStateProps> = ({ onRetry }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className="sr-cva-glass sr-cva-state"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="sr-cva-state__icon" style={{ background: 'color-mix(in srgb, #ef4444 12%, transparent)', color: '#ef4444' }}>
        <AlertCircle className="h-8 w-8" aria-hidden />
      </div>
      <h2 className="sr-cva-state__title">{t('student.internshipOffers.cvDashboard.error.title')}</h2>
      <p className="sr-cva-state__desc">{t('student.internshipOffers.cvDashboard.error.desc')}</p>
      <button type="button" className="sr-cva-btn sr-cva-btn--primary" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" aria-hidden />
        {t('student.internshipOffers.cvDashboard.error.retry')}
      </button>
    </motion.div>
  );
};
