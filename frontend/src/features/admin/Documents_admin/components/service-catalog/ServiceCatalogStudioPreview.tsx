import { FunctionComponent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import type { DocumentServiceWritePayload } from '../../types/documentServiceCatalog';
import ServiceCatalogCard from './ServiceCatalogCard';
import { buildPreviewService } from './serviceCatalogPreview';
import { enabledWorkflowCount, getWorkloadLevel } from './serviceCatalogStudioSteps';

interface Props {
  value: DocumentServiceWritePayload;
}

const ServiceCatalogStudioPreview: FunctionComponent<Props> = ({ value }) => {
  const { t } = useTranslation();
  const P = 'admin.documentsModule.catalog.form.studio';

  const preview = useMemo(
    () =>
      buildPreviewService(
        value,
        t(`${P}.untitled`),
        t(`${P}.codePlaceholder`),
      ),
    [value, t],
  );

  const workload = getWorkloadLevel(value.config.processing.estimatedHours);
  const wfCount = enabledWorkflowCount(value);

  return (
    <aside className="admin-doc-studio-preview" aria-label={t(`${P}.previewTitle`)}>
      <div className="admin-doc-studio-preview__head">
        <Eye className="h-4 w-4 text-[var(--admin-brand)]" aria-hidden />
        <motion.div>
          <h2 className="admin-doc-studio-preview__title">{t(`${P}.previewTitle`)}</h2>
          <p className="admin-doc-studio-preview__subtitle">{t(`${P}.previewSubtitle`)}</p>
        </motion.div>
      </div>

      <motion.div
        className="admin-doc-studio-preview__card-wrap"
        key={`${preview.name}-${preview.code}-${preview.colorTheme}`}
        initial={{ opacity: 0.85, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <ServiceCatalogCard service={preview} preview />
      </motion.div>

      <ul className="admin-doc-studio-preview__meta">
        <li>
          <span>{t(`${P}.complexity`)}</span>
          <strong>{t(`${P}.helpers.workload.${workload}`)}</strong>
        </li>
        <li>
          <span>{t(`${P}.workflowSteps`)}</span>
          <strong>{wfCount}</strong>
        </li>
        <li>
          <span>{t(`${P}.deliveryModes`)}</span>
          <strong>
            {[
              preview.onlineEnabled && t('admin.documentsModule.catalog.badges.online'),
              preview.physicalEnabled && t('admin.documentsModule.catalog.badges.physical'),
            ]
              .filter(Boolean)
              .join(' · ') || '—'}
          </strong>
        </li>
      </ul>
    </aside>
  );
};

export default ServiceCatalogStudioPreview;
