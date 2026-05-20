import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Layers, Sparkles } from 'lucide-react';
import type { DocumentServiceWritePayload } from '../../types/documentServiceCatalog';
import { resolveServiceIcon } from './serviceCatalogIcons';
import { enabledWorkflowCount } from './serviceCatalogStudioSteps';

interface Props {
  value: DocumentServiceWritePayload;
  isEdit: boolean;
  completedSteps: number;
  totalSteps: number;
}

const ServiceCatalogStudioHero: FunctionComponent<Props> = ({
  value,
  isEdit,
  completedSteps,
  totalSteps,
}) => {
  const { t } = useTranslation();
  const Icon = resolveServiceIcon(value.iconKey ?? 'file-text');
  const cfg = value.config;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const wfCount = enabledWorkflowCount(value);

  return (
    <motion.header
      className="admin-doc-studio-hero"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="admin-doc-studio-hero__glow"
        aria-hidden
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="admin-doc-studio-hero__inner">
        <div className="admin-doc-studio-hero__lead">
          <span className={`admin-doc-studio-hero__icon admin-doc-studio-hero__icon--${value.colorTheme ?? 'brand'}`}>
            <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="admin-doc-studio-hero__copy">
            <span className="admin-doc-studio-hero__badge">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t('admin.documentsModule.catalog.form.studio.badge')}
            </span>
            <h1 className="admin-doc-studio-hero__title">
              {value.name.trim() ||
                (isEdit
                  ? t('admin.documentsModule.catalog.form.editTitle')
                  : t('admin.documentsModule.catalog.form.createTitle'))}
            </h1>
            <p className="admin-doc-studio-hero__subtitle">
              {value.description?.trim() || t('admin.documentsModule.catalog.form.studio.heroHelper')}
            </p>
            <motion.div className="admin-doc-studio-hero__chips" layout>
              {value.code.trim() ? (
                <code className="admin-doc-studio-hero__chip">{value.code}</code>
              ) : null}
              <span className="admin-doc-studio-hero__chip">
                {t(`admin.documentsModule.catalog.categories.${value.category}`)}
              </span>
              {cfg.availability.isActive ? (
                <span className="admin-doc-studio-hero__chip admin-doc-studio-hero__chip--live">
                  {t('admin.documentsModule.catalog.form.studio.statusActive')}
                </span>
              ) : (
                <span className="admin-doc-studio-hero__chip admin-doc-studio-hero__chip--muted">
                  {t('admin.documentsModule.catalog.form.studio.statusDraft')}
                </span>
              )}
            </motion.div>
          </div>
        </div>

        <div className="admin-doc-studio-hero__metrics">
          <div className="admin-doc-studio-hero__metric">
            <span className="admin-doc-studio-hero__metric-label">
              {t('admin.documentsModule.catalog.form.studio.progressLabel')}
            </span>
            <div className="admin-doc-studio-hero__progress-track">
              <motion.div
                className="admin-doc-studio-hero__progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="admin-doc-studio-hero__metric-value">
              {t('admin.documentsModule.catalog.form.studio.stepsComplete', {
                done: completedSteps,
                total: totalSteps,
              })}
            </span>
          </div>
          <div className="admin-doc-studio-hero__metric-card">
            <Layers className="h-4 w-4" aria-hidden />
            <div>
              <span className="admin-doc-studio-hero__metric-card-label">
                {t('admin.documentsModule.catalog.form.studio.workflowSteps')}
              </span>
              <strong>{wfCount}</strong>
            </div>
          </div>
          <motion.div className="admin-doc-studio-hero__metric-card" layout>
            <span className="admin-doc-studio-hero__metric-card-label">SLA</span>
            <strong>{cfg.processing.slaHours}h</strong>
          </motion.div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default ServiceCatalogStudioHero;
