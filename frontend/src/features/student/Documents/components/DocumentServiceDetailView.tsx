import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  Download,
  FileCheck2,
  FileText,
  FormInput,
  GitBranch,
  Globe,
  Hash,
  ListChecks,
  MapPin,
  Paperclip,
  PenLine,
  ShieldCheck,
  Store,
  Timer,
  Truck,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DocumentServiceCatalogItem } from '../../../admin/Documents_admin/types/documentServiceCatalog';
import { resolveServiceIcon } from '../../../admin/Documents_admin/components/service-catalog/serviceCatalogIcons';
import { isCustomServiceColor, serviceAccentStyle } from '../../../admin/Documents_admin/components/service-catalog/serviceCatalogColor';
import DocumentDetailSectionCard from './DocumentDetailSectionCard';
import DocumentDetailMessageBanner from './DocumentDetailMessageBanner';
import DocumentServiceTemplatePreviewPanel from './DocumentServiceTemplatePreviewPanel';
import { useStudentDocumentTemplatePreview } from '../hooks/useStudentDocumentTemplatePreview';
import { buildDocumentServiceDetailViewModel } from '../utils/buildDocumentServiceDetailViewModel';

interface DocumentServiceDetailViewProps {
  item: DocumentServiceCatalogItem;
}

const DELIVERY_CHIP_ICONS: Record<string, LucideIcon> = {
  online: Globe,
  physical: Store,
  reservation: Calendar,
  autoGen: Zap,
};

function DeliveryChipIcon({ label }: { label: string }) {
  const { t } = useTranslation();
  const online = t('admin.documentsModule.catalog.badges.online');
  const physical = t('admin.documentsModule.catalog.badges.physical');
  const reservation = t('admin.documentsModule.catalog.badges.reservation');
  const autoGen = t('admin.documentsModule.catalog.badges.autoGen');

  let Icon = CircleDot;
  if (label === online) Icon = DELIVERY_CHIP_ICONS.online;
  else if (label === physical) Icon = DELIVERY_CHIP_ICONS.physical;
  else if (label === reservation) Icon = DELIVERY_CHIP_ICONS.reservation;
  else if (label === autoGen) Icon = DELIVERY_CHIP_ICONS.autoGen;

  return <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />;
}

const DocumentServiceDetailView: FunctionComponent<DocumentServiceDetailViewProps> = ({ item }) => {
  const { t } = useTranslation();
  const model = useMemo(() => buildDocumentServiceDetailViewModel(item, t), [item, t]);
  const templatePreview = useStudentDocumentTemplatePreview(item);
  const Icon = resolveServiceIcon(item.iconKey);
  const customColor = isCustomServiceColor(item.colorTheme);

  return (
    <div className="student-document-detail-page__layout">
      <header className="student-document-detail-page__hero">
        <div className="student-document-detail-page__hero-accent" aria-hidden />
        <div className="student-document-detail-page__hero-inner">
          <span
            className={`student-document-detail-page__icon ${customColor ? '' : `admin-doc-svc-card--${item.colorTheme}`}`}
            style={serviceAccentStyle(item.colorTheme)}
            aria-hidden
          >
            <Icon className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="student-document-detail-page__category">{model.categoryLabel}</p>
            <h1 className="student-document-detail-page__title">{item.name}</h1>
            <p className="student-document-detail-page__code">
              <Hash className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <code>{item.code}</code>
            </p>
            {model.deliveryChips.length > 0 ? (
              <div className="student-document-detail-page__hero-chips">
                {model.deliveryChips.map((chip) => (
                  <span key={chip} className="student-document-detail-page__hero-chip">
                    <DeliveryChipIcon label={chip} />
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="student-document-detail-page__description">{item.description}</p>
          </div>
        </div>
      </header>

      <div
        className={`student-document-detail-page__grid ${templatePreview.enabled ? 'has-preview' : ''}`}
      >
        <div className="student-document-detail-page__main">
          {model.deliveryChips.length > 0 ? (
            <DocumentDetailSectionCard
              id="doc-detail-delivery"
              title={t('student.documents.detail.sections.delivery')}
              icon={Truck}
            >
              <DocumentDetailMessageBanner variant="info" compact title={t('student.documents.feedback.requestModeTitle')}>
                {model.requestModeLabel}
              </DocumentDetailMessageBanner>
              <ul className="student-document-detail-page__meta-list">
                {item.config.delivery.online.downloadablePdf ? (
                  <li>
                    <Download className="h-4 w-4 shrink-0" aria-hidden />
                    {t('student.documents.detail.delivery.downloadPdf')}
                  </li>
                ) : null}
                {item.config.delivery.online.portalDelivery ? (
                  <li>
                    <FileText className="h-4 w-4 shrink-0" aria-hidden />
                    {t('student.documents.detail.delivery.portal')}
                  </li>
                ) : null}
                {item.config.delivery.physical.pickupRequired ? (
                  <li>
                    <Store className="h-4 w-4 shrink-0" aria-hidden />
                    {t('student.documents.detail.delivery.pickup')}
                  </li>
                ) : null}
                {item.reservationRequired ? (
                  <li>
                    <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                    {t('student.documents.detail.delivery.reservation')}
                  </li>
                ) : null}
              </ul>
            </DocumentDetailSectionCard>
          ) : null}

          <DocumentDetailSectionCard
            id="doc-detail-processing"
            title={t('student.documents.detail.sections.processing')}
            icon={Timer}
          >
            <dl className="student-document-detail-page__facts">
              {model.processingInfo.map((row, index) => (
                <div key={row.label} className="student-document-detail-page__fact">
                  <dt>
                    {index === 0 ? (
                      <Clock className="h-4 w-4 shrink-0" aria-hidden />
                    ) : index === 1 ? (
                      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <Zap className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    {row.label}
                  </dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </DocumentDetailSectionCard>

          {model.workflowSteps.length > 0 ? (
            <DocumentDetailSectionCard
              id="doc-detail-workflow"
              title={t('student.documents.detail.sections.workflow')}
              icon={GitBranch}
              className="student-document-detail-page__card--wide"
            >
              <ol className="student-document-detail-page__steps">
                {model.workflowSteps.map((step, index) => (
                  <li key={`${step}-${index}`}>
                    <span className="student-document-detail-page__step-index">{index + 1}</span>
                    <ListChecks className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </DocumentDetailSectionCard>
          ) : null}

          {model.prerequisites.length > 0 ? (
            <DocumentDetailSectionCard
              id="doc-detail-prerequisites"
              title={t('student.documents.detail.sections.prerequisites')}
              icon={ShieldCheck}
            >
              <ul className="student-document-detail-page__icon-list">
                {model.prerequisites.map((rule) => (
                  <li key={rule}>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </DocumentDetailSectionCard>
          ) : null}

          {model.attachments.length > 0 ? (
            <DocumentDetailSectionCard
              id="doc-detail-attachments"
              title={t('student.documents.detail.sections.attachments')}
              icon={Paperclip}
            >
              <ul className="student-document-detail-page__checklist">
                {model.attachments.map((attachment) => (
                  <li key={attachment.label}>
                    <span className="student-document-detail-page__checklist-label">
                      <FileCheck2 className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" aria-hidden />
                      {attachment.label}
                    </span>
                    <span
                      className={
                        attachment.required
                          ? 'student-document-detail-page__tag student-document-detail-page__tag--required'
                          : 'student-document-detail-page__tag'
                      }
                    >
                      {attachment.required
                        ? t('student.documents.detail.required')
                        : t('student.documents.detail.optional')}
                    </span>
                  </li>
                ))}
              </ul>
            </DocumentDetailSectionCard>
          ) : null}

          {model.dynamicFields.length > 0 ? (
            <DocumentDetailSectionCard
              id="doc-detail-fields"
              title={t('student.documents.detail.sections.fields')}
              icon={FormInput}
            >
              <ul className="student-document-detail-page__checklist">
                {model.dynamicFields.map((field) => (
                  <li key={field.label}>
                    <span className="student-document-detail-page__checklist-label">
                      <FormInput className="h-4 w-4 shrink-0 text-[var(--admin-text-muted)]" aria-hidden />
                      {field.label}
                    </span>
                    <span
                      className={
                        field.required
                          ? 'student-document-detail-page__tag student-document-detail-page__tag--required'
                          : 'student-document-detail-page__tag'
                      }
                    >
                      {field.required
                        ? t('student.documents.detail.required')
                        : t('student.documents.detail.optional')}
                    </span>
                  </li>
                ))}
              </ul>
            </DocumentDetailSectionCard>
          ) : null}

          {model.pickupInfo.length > 0 ? (
            <DocumentDetailSectionCard
              id="doc-detail-pickup"
              title={t('student.documents.detail.sections.pickup')}
              icon={MapPin}
            >
              <dl className="student-document-detail-page__facts">
                {model.pickupInfo.map((row, index) => (
                  <div key={row.label} className="student-document-detail-page__fact">
                    <dt>
                      {index === 0 ? (
                        <Building2 className="h-4 w-4 shrink-0" aria-hidden />
                      ) : index === 1 ? (
                        <Store className="h-4 w-4 shrink-0" aria-hidden />
                      ) : index === 2 ? (
                        <Clock className="h-4 w-4 shrink-0" aria-hidden />
                      ) : (
                        <PenLine className="h-4 w-4 shrink-0" aria-hidden />
                      )}
                      {row.label}
                    </dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </DocumentDetailSectionCard>
          ) : null}
        </div>

        {templatePreview.enabled ? (
          <DocumentServiceTemplatePreviewPanel
            fileName={templatePreview.fileName}
            preview={templatePreview.preview}
            loading={templatePreview.loading}
            error={templatePreview.error}
          />
        ) : null}
      </div>
    </div>
  );
};

export default DocumentServiceDetailView;
