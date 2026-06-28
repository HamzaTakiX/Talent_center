import { FunctionComponent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileStack, Zap } from 'lucide-react';

import AdminToggle from '../../../account/components/AdminToggle';
import AdminFormSection from '../../../shared/forms/AdminFormSection';
import { AdminFormField, AdminFormInput, AdminFormTextarea } from '../../../shared/forms/AdminFormPrimitives';

import type {
  DocumentServiceConfig,
  DocumentServiceWritePayload,
  ServiceCatalogFormTab,
} from '../../types/documentServiceCatalog';

import ServiceCatalogIconPicker from './ServiceCatalogIconPicker';
import ServiceCatalogColorThemePicker from './ServiceCatalogColorThemePicker';
import ServiceCatalogCategoryCards from './ServiceCatalogCategoryCards';
import ServiceCatalogEligibilityCards from './ServiceCatalogEligibilityCards';
import ServiceCatalogDurationInput from './ServiceCatalogDurationInput';
import ServiceCatalogTimeRangePicker from './ServiceCatalogTimeRangePicker';
import ServiceCatalogAttachmentChips from './ServiceCatalogAttachmentChips';
import ServiceCatalogCollapsibleSection from './ServiceCatalogCollapsibleSection';
import ServiceCatalogValidationCards from './ServiceCatalogValidationCards';
import {
  ServiceCatalogRequestModeCards,
  ServiceCatalogDeliveryCards,
  ServiceCatalogToggleCard,
} from './ServiceCatalogToggleCards';
import ServiceCatalogStudioFooter from './ServiceCatalogStudioFooter';
import ServiceCatalogStudioHelpers from './ServiceCatalogStudioHelpers';
import ServiceCatalogStudioHero from './ServiceCatalogStudioHero';
import ServiceCatalogStudioStepsNav from './ServiceCatalogStudioStepsNav';
import { generateServiceCode } from './generateServiceCode';
import { resolveActiveStep } from './serviceCatalogStepVisibility';

interface Props {
  value: DocumentServiceWritePayload;
  onChange: (next: DocumentServiceWritePayload) => void;
  isEdit?: boolean;
  serviceId?: string;
  saving?: boolean;
  onCancel: () => void;
  onSave: () => void;
  onPendingTemplateFileChange?: (file: File | null) => void;
}

const ServiceCatalogForm: FunctionComponent<Props> = ({
  value,
  onChange,
  isEdit = false,
  serviceId,
  saving = false,
  onCancel,
  onSave,
  onPendingTemplateFileChange,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ServiceCatalogFormTab>('information');
  const cfg = value.config;
  const P = 'admin.documentsModule.catalog.form.studio';

  useEffect(() => {
    setTab((current) => resolveActiveStep(current, value));
  }, [value.config.availability.autoGenerateEnabled, value.config.delivery.physical.enabled]);

  const patchNested = <K extends keyof DocumentServiceConfig>(
    key: K,
    partial: Partial<DocumentServiceConfig[K]>,
  ) => {
    onChange({
      ...value,
      config: { ...cfg, [key]: { ...(cfg[key] as object), ...partial } },
    });
  };

  const handleNameChange = (name: string) => {
    const code = isEdit ? value.code : generateServiceCode(name);
    onChange({ ...value, name, code });
  };

  const panel = (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        className="admin-doc-studio-panel__body"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.28 }}
      >
        {tab === 'information' && (
          <AdminFormSection
            title={t('admin.documentsModule.catalog.form.sections.information')}
            description={t('admin.documentsModule.catalog.form.sections.informationHint')}
          >
            <motion.div className="admin-form-grid admin-form-grid--2">
              <AdminFormField
                label={t('admin.documentsModule.catalog.form.name')}
                required
                className="admin-form-grid__full"
              >
                <AdminFormInput
                  value={value.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t(`${P}.namePlaceholder`)}
                />
              </AdminFormField>
              <AdminFormField
                label={t('admin.documentsModule.catalog.form.description')}
                className="admin-form-grid__full"
              >
                <AdminFormTextarea
                  value={value.description ?? ''}
                  onChange={(e) => onChange({ ...value, description: e.target.value })}
                  rows={3}
                  placeholder={t(`${P}.descriptionPlaceholder`)}
                />
              </AdminFormField>
            </motion.div>
            <ServiceCatalogCategoryCards
              value={value.category}
              onChange={(category) => onChange({ ...value, category })}
            />
            <ServiceCatalogColorThemePicker
              colorTheme={value.colorTheme ?? 'brand'}
              onThemeChange={(colorTheme) => onChange({ ...value, colorTheme })}
            />
            <ServiceCatalogIconPicker
              iconKey={value.iconKey ?? 'file-text'}
              onIconChange={(iconKey) => onChange({ ...value, iconKey })}
            />
          </AdminFormSection>
        )}

        {tab === 'visibility' && (
          <AdminFormSection
            title={t('admin.documentsModule.catalog.form.sections.visibility')}
            description={t('admin.documentsModule.catalog.form.sections.visibilityHint')}
          >
            <div className="admin-doc-studio-toggle-cards admin-doc-studio-toggle-cards--compact">
              <ServiceCatalogToggleCard
                id="svc-active"
                icon={FileStack}
                label={t('admin.documentsModule.catalog.form.toggles.active')}
                description={t(`${P}.visibility.activeDesc`)}
                checked={cfg.availability.isActive}
                onChange={(isActive) => patchNested('availability', { isActive })}
              />
              <ServiceCatalogToggleCard
                id="svc-visible"
                icon={FileStack}
                label={t('admin.documentsModule.catalog.form.toggles.visibleStudents')}
                description={t(`${P}.visibility.visibleDesc`)}
                checked={cfg.availability.visibleToStudents}
                onChange={(visibleToStudents) => patchNested('availability', { visibleToStudents })}
              />
            </div>
            <ServiceCatalogEligibilityCards
              internshipOnly={cfg.eligibility.internshipStudentsOnly}
              finalYearOnly={cfg.eligibility.finalYearOnly}
              onInternshipChange={(internshipStudentsOnly) =>
                patchNested('eligibility', { internshipStudentsOnly })
              }
              onFinalYearChange={(finalYearOnly) => patchNested('eligibility', { finalYearOnly })}
            />
          </AdminFormSection>
        )}

        {tab === 'requestMode' && (
          <AdminFormSection
            title={t('admin.documentsModule.catalog.form.sections.requestMode')}
            description={t('admin.documentsModule.catalog.form.sections.requestModeHint')}
          >
            <ServiceCatalogRequestModeCards
              onlineRequestEnabled={cfg.availability.onlineRequestEnabled}
              autoGenerateEnabled={cfg.availability.autoGenerateEnabled}
              serviceId={serviceId}
              template={cfg.template}
              onOnlineChange={(onlineRequestEnabled) =>
                patchNested('availability', { onlineRequestEnabled })
              }
              onAutoGenerateChange={(autoGenerateEnabled) =>
                patchNested('availability', { autoGenerateEnabled })
              }
              onTemplateChange={(template) =>
                onChange({ ...value, config: { ...cfg, template } })
              }
              onPendingTemplateFileChange={onPendingTemplateFileChange}
            />
          </AdminFormSection>
        )}

        {tab === 'processing' && (
          <AdminFormSection
            title={t('admin.documentsModule.catalog.form.sections.processing')}
            description={t('admin.documentsModule.catalog.form.sections.processingHint')}
          >
            <div className="admin-doc-studio-processing">
              <div className="admin-doc-studio-processing__primary">
                <AdminFormField label={t('admin.documentsModule.catalog.form.estimatedHours')}>
                  <ServiceCatalogDurationInput
                    hours={cfg.processing.estimatedHours}
                    onChange={(estimatedHours) => patchNested('processing', { estimatedHours })}
                  />
                </AdminFormField>
              </div>

              <div className="admin-doc-studio-processing__advanced">
                <ServiceCatalogCollapsibleSection
                  title={t(`${P}.processing.advancedTitle`)}
                  description={t(`${P}.processing.advancedDesc`)}
                >
                  <div className="admin-doc-studio-processing__sla-grid">
                    <AdminFormField label={t('admin.documentsModule.catalog.form.slaHours')}>
                      <AdminFormInput
                        type="number"
                        min={1}
                        className="admin-doc-studio-processing__input"
                        value={cfg.processing.slaHours}
                        onChange={(e) =>
                          patchNested('processing', { slaHours: Number(e.target.value) || 48 })
                        }
                      />
                    </AdminFormField>
                    <AdminFormField label={t('admin.documentsModule.catalog.form.escalationHours')}>
                      <AdminFormInput
                        type="number"
                        min={1}
                        className="admin-doc-studio-processing__input"
                        value={cfg.processing.escalationHours}
                        onChange={(e) =>
                          patchNested('processing', { escalationHours: Number(e.target.value) || 36 })
                        }
                      />
                    </AdminFormField>
                  </div>

                  <div className="admin-doc-studio-processing__toggle">
                    <AdminToggle
                      id="svc-escalation"
                      label={t('admin.documentsModule.catalog.form.toggles.autoEscalation')}
                      description={t(`${P}.processing.autoEscalationDesc`)}
                      checked={cfg.processing.autoEscalation}
                      onChange={(autoEscalation) => patchNested('processing', { autoEscalation })}
                    />
                  </div>
                </ServiceCatalogCollapsibleSection>
              </div>
            </div>
          </AdminFormSection>
        )}

        {tab === 'delivery' && (
          <AdminFormSection
            title={t('admin.documentsModule.catalog.form.sections.delivery')}
            description={t('admin.documentsModule.catalog.form.sections.deliveryHint')}
          >
            <ServiceCatalogDeliveryCards
              onlineEnabled={cfg.delivery.online.enabled}
              downloadablePdf={cfg.delivery.online.downloadablePdf}
              emailDelivery={cfg.delivery.online.emailDelivery}
              physicalEnabled={cfg.delivery.physical.enabled}
              reservationRequired={cfg.delivery.physical.reservationRequired}
              signatureRequired={cfg.delivery.physical.signatureRequired}
              onOnlineEnabled={(enabled) =>
                patchNested('delivery', { online: { ...cfg.delivery.online, enabled } })
              }
              onDownloadablePdf={(downloadablePdf) =>
                patchNested('delivery', { online: { ...cfg.delivery.online, downloadablePdf } })
              }
              onEmailDelivery={(emailDelivery) =>
                patchNested('delivery', { online: { ...cfg.delivery.online, emailDelivery } })
              }
              onPhysicalEnabled={(enabled) =>
                patchNested('delivery', { physical: { ...cfg.delivery.physical, enabled } })
              }
              onReservationRequired={(reservationRequired) =>
                patchNested('delivery', {
                  physical: { ...cfg.delivery.physical, reservationRequired },
                })
              }
              onSignatureRequired={(signatureRequired) =>
                patchNested('delivery', {
                  physical: { ...cfg.delivery.physical, signatureRequired },
                })
              }
            />
          </AdminFormSection>
        )}

        {tab === 'pickup' && cfg.delivery.physical.enabled && (
          <AdminFormSection
            title={t('admin.documentsModule.catalog.form.sections.pickup')}
            description={t('admin.documentsModule.catalog.form.sections.pickupHint')}
          >
            <div className="admin-form-grid admin-form-grid--2">
              <AdminFormField label={t('admin.documentsModule.catalog.form.pickupOffice')}>
                <AdminFormInput
                  value={cfg.pickup.pickupOffice}
                  onChange={(e) => patchNested('pickup', { pickupOffice: e.target.value })}
                  placeholder={t(`${P}.pickup.officePlaceholder`)}
                />
              </AdminFormField>
              <AdminFormField label={t('admin.documentsModule.catalog.form.responsibleService')}>
                <AdminFormInput
                  value={cfg.pickup.responsibleService}
                  onChange={(e) => patchNested('pickup', { responsibleService: e.target.value })}
                  placeholder={t(`${P}.pickup.servicePlaceholder`)}
                />
              </AdminFormField>
              <AdminFormField
                label={t('admin.documentsModule.catalog.form.openingHours')}
                className="admin-form-grid__full"
              >
                <ServiceCatalogTimeRangePicker
                  value={cfg.pickup.openingHours}
                  onChange={(openingHours) => patchNested('pickup', { openingHours })}
                />
              </AdminFormField>
            </div>
          </AdminFormSection>
        )}

        {tab === 'attachments' && (
          <AdminFormSection
            title={t('admin.documentsModule.catalog.form.sections.attachments')}
            description={t('admin.documentsModule.catalog.form.sections.attachmentsHint')}
          >
            <ServiceCatalogAttachmentChips
              attachments={cfg.requiredAttachments}
              onChange={(requiredAttachments) => patchNested('requiredAttachments', requiredAttachments)}
            />
          </AdminFormSection>
        )}

        {tab === 'validation' && (
          <AdminFormSection
            title={t('admin.documentsModule.catalog.form.sections.validation')}
            description={t('admin.documentsModule.catalog.form.sections.validationHint')}
          >
            <ServiceCatalogValidationCards
              validation={cfg.validation}
              onChange={(partial) => patchNested('validation', partial)}
            />
          </AdminFormSection>
        )}

        {tab === 'workflowAutomation' && (
          <>
            <AdminFormSection
              title={t('admin.documentsModule.catalog.form.sections.workflow')}
              description={t(`${P}.workflowHint`)}
            >
              <ul className="admin-doc-studio-workflow-list">
                {cfg.workflow.steps.map((step, idx) => (
                  <li key={step.code} className="admin-doc-studio-workflow-item">
                    <AdminToggle
                      id={`wf-${step.code}`}
                      label={t(step.labelKey)}
                      checked={step.enabled}
                      onChange={(enabled) => {
                        const steps = [...cfg.workflow.steps];
                        steps[idx] = { ...step, enabled };
                        patchNested('workflow', { steps });
                      }}
                    />
                  </li>
                ))}
              </ul>
            </AdminFormSection>
            <AdminFormSection
              title={t('admin.documentsModule.catalog.form.sections.automation')}
              description={t('admin.documentsModule.catalog.form.sections.automationHint')}
            >
              <div className="admin-doc-studio-toggle-cards">
                <ServiceCatalogToggleCard
                  id="auto-remind"
                  icon={Zap}
                  label={t('admin.documentsModule.catalog.form.toggles.reminders')}
                  checked={cfg.automation.reminders}
                  onChange={(reminders) => patchNested('automation', { reminders })}
                />
                <ServiceCatalogToggleCard
                  id="auto-esc"
                  icon={Zap}
                  label={t('admin.documentsModule.catalog.form.toggles.escalation')}
                  checked={cfg.automation.escalation}
                  onChange={(escalation) => patchNested('automation', { escalation })}
                />
                <ServiceCatalogToggleCard
                  id="auto-notif"
                  icon={Zap}
                  label={t('admin.documentsModule.catalog.form.toggles.notifications')}
                  checked={cfg.automation.notifications}
                  onChange={(notifications) => patchNested('automation', { notifications })}
                />
              </div>
            </AdminFormSection>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="admin-doc-studio">
      <ServiceCatalogStudioHero value={value} isEdit={isEdit} />
      <ServiceCatalogStudioHelpers value={value} />

      <div className="admin-doc-studio__layout">
        <div className="admin-doc-studio__nav-col">
          <ServiceCatalogStudioStepsNav active={tab} value={value} onSelect={setTab} />
        </div>

        <div className="admin-doc-studio__main">
          <section className="admin-doc-studio-panel" aria-labelledby="studio-panel-title">
            <header className="admin-doc-studio-panel__head">
              <FileStack className="h-5 w-5 text-[var(--admin-brand)]" aria-hidden />
              <div>
                <h2 id="studio-panel-title" className="admin-doc-studio-panel__title">
                  {t(`admin.documentsModule.catalog.form.tabs.${tab}`)}
                </h2>
                <p className="admin-doc-studio-panel__desc">
                  {t(`admin.documentsModule.catalog.form.sections.${tab}Hint`, {
                    defaultValue: t(`admin.documentsModule.catalog.form.sections.${tab}`),
                  })}
                </p>
              </div>
            </header>
            {panel}
          </section>

          <ServiceCatalogStudioFooter
            onCancel={onCancel}
            onSave={onSave}
            saving={saving}
            disabled={!value.name.trim()}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalogForm;
