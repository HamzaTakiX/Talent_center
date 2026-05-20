import { FunctionComponent, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { FileStack, FormInput, Paperclip } from 'lucide-react';

import AdminToggle from '../../../account/components/AdminToggle';

import AdminFormSection from '../../../shared/forms/AdminFormSection';

import { AdminFormField, AdminFormInput, AdminFormTextarea } from '../../../shared/forms/AdminFormPrimitives';

import { AdminSelectField } from '../../../ui';

import type {

  DocumentServiceConfig,

  DocumentServiceWritePayload,

  ServiceCatalogFormTab,

} from '../../types/documentServiceCatalog';

import ServiceCatalogIconPicker from './ServiceCatalogIconPicker';

import ServiceCatalogStudioEmpty from './ServiceCatalogStudioEmpty';

import ServiceCatalogStudioFooter from './ServiceCatalogStudioFooter';

import ServiceCatalogStudioHelpers from './ServiceCatalogStudioHelpers';

import ServiceCatalogStudioHero from './ServiceCatalogStudioHero';

import ServiceCatalogStudioPreview from './ServiceCatalogStudioPreview';

import ServiceCatalogStudioStepsNav from './ServiceCatalogStudioStepsNav';

import { STUDIO_STEPS, countCompletedSteps } from './serviceCatalogStudioSteps';



interface Props {

  value: DocumentServiceWritePayload;

  onChange: (next: DocumentServiceWritePayload) => void;

  isEdit?: boolean;

  saving?: boolean;

  onCancel: () => void;

  onSave: () => void;

}



const ServiceCatalogForm: FunctionComponent<Props> = ({

  value,

  onChange,

  isEdit = false,

  saving = false,

  onCancel,

  onSave,

}) => {

  const { t } = useTranslation();

  const [tab, setTab] = useState<ServiceCatalogFormTab>('basic');

  const cfg = value.config;

  const completedSteps = useMemo(() => countCompletedSteps(value), [value]);

  const P = 'admin.documentsModule.catalog.form.studio';



  const patchNested = <K extends keyof DocumentServiceConfig>(

    key: K,

    partial: Partial<DocumentServiceConfig[K]>,

  ) => {

    onChange({

      ...value,

      config: { ...cfg, [key]: { ...(cfg[key] as object), ...partial } },

    });

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

        {tab === 'basic' && (

          <AdminFormSection

            title={t('admin.documentsModule.catalog.form.sections.basic')}

            description={t('admin.documentsModule.catalog.form.sections.basicHint')}

          >

            <motion.div className="admin-form-grid admin-form-grid--2">

              <AdminFormField label={t('admin.documentsModule.catalog.form.name')} required>

                <AdminFormInput

                  value={value.name}

                  onChange={(e) => onChange({ ...value, name: e.target.value })}

                  placeholder={t(`${P}.namePlaceholder`)}

                />

              </AdminFormField>

              <AdminFormField label={t('admin.documentsModule.catalog.form.code')} required>

                <AdminFormInput

                  value={value.code}

                  onChange={(e) => onChange({ ...value, code: e.target.value })}

                  placeholder={t(`${P}.codePlaceholder`)}

                />

              </AdminFormField>

              <AdminFormField label={t('admin.documentsModule.catalog.form.category')} className="admin-form-grid__full">

                <AdminSelectField

                  value={value.category}

                  onChange={(category) =>

                    onChange({ ...value, category: category as DocumentServiceWritePayload['category'] })

                  }

                  options={[

                    { value: 'ATTESTATION', label: t('admin.documentsModule.catalog.categories.ATTESTATION') },

                    { value: 'CONVENTION', label: t('admin.documentsModule.catalog.categories.CONVENTION') },

                    { value: 'CERTIFICATE', label: t('admin.documentsModule.catalog.categories.CERTIFICATE') },

                    { value: 'AUTHORIZATION', label: t('admin.documentsModule.catalog.categories.AUTHORIZATION') },

                    { value: 'REPORT', label: t('admin.documentsModule.catalog.categories.REPORT') },

                    { value: 'OTHER', label: t('admin.documentsModule.catalog.categories.OTHER') },

                  ]}

                />

              </AdminFormField>

              <AdminFormField label={t('admin.documentsModule.catalog.form.description')} className="admin-form-grid__full">

                <AdminFormTextarea

                  value={value.description ?? ''}

                  onChange={(e) => onChange({ ...value, description: e.target.value })}

                  rows={3}

                  placeholder={t(`${P}.descriptionPlaceholder`)}

                />

              </AdminFormField>

            </motion.div>

            <ServiceCatalogIconPicker

              iconKey={value.iconKey ?? 'file-text'}

              colorTheme={value.colorTheme ?? 'brand'}

              onIconChange={(iconKey) => onChange({ ...value, iconKey })}

              onThemeChange={(colorTheme) => onChange({ ...value, colorTheme })}

            />

          </AdminFormSection>

        )}



        {tab === 'availability' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.availability')}>

            <div className="admin-doc-studio-toggle-grid">

              <AdminToggle

                id="svc-active"

                label={t('admin.documentsModule.catalog.form.toggles.active')}

                checked={cfg.availability.isActive}

                onChange={(isActive) => patchNested('availability', { isActive })}

              />

              <AdminToggle

                id="svc-visible"

                label={t('admin.documentsModule.catalog.form.toggles.visibleStudents')}

                checked={cfg.availability.visibleToStudents}

                onChange={(visibleToStudents) => patchNested('availability', { visibleToStudents })}

              />

              <AdminToggle

                id="svc-online-req"

                label={t('admin.documentsModule.catalog.form.toggles.onlineRequest')}

                checked={cfg.availability.onlineRequestEnabled}

                onChange={(onlineRequestEnabled) => patchNested('availability', { onlineRequestEnabled })}

              />

              <AdminToggle

                id="svc-physical-only"

                label={t('admin.documentsModule.catalog.form.toggles.physicalOnly')}

                checked={cfg.availability.physicalOnly}

                onChange={(physicalOnly) => patchNested('availability', { physicalOnly })}

              />

              <AdminToggle

                id="svc-auto-gen"

                label={t('admin.documentsModule.catalog.form.toggles.autoGenerate')}

                checked={cfg.availability.autoGenerateEnabled}

                onChange={(autoGenerateEnabled) => patchNested('availability', { autoGenerateEnabled })}

              />

            </div>

          </AdminFormSection>

        )}



        {tab === 'eligibility' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.eligibility')}>

            <AdminFormField

              label={t('admin.documentsModule.catalog.form.academicYears')}

              hint={t('admin.documentsModule.catalog.form.academicYearsHint')}

            >

              <AdminFormInput

                value={cfg.eligibility.academicYears.join(', ')}

                onChange={(e) =>

                  patchNested('eligibility', {

                    academicYears: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),

                  })

                }

                placeholder={t(`${P}.academicYearsPlaceholder`)}

              />

            </AdminFormField>

            <div className="admin-doc-studio-toggle-grid">

              <AdminToggle

                id="svc-internship"

                label={t('admin.documentsModule.catalog.form.toggles.internshipOnly')}

                checked={cfg.eligibility.internshipStudentsOnly}

                onChange={(internshipStudentsOnly) => patchNested('eligibility', { internshipStudentsOnly })}

              />

              <AdminToggle

                id="svc-final-year"

                label={t('admin.documentsModule.catalog.form.toggles.finalYearOnly')}

                checked={cfg.eligibility.finalYearOnly}

                onChange={(finalYearOnly) => patchNested('eligibility', { finalYearOnly })}

              />

            </div>

          </AdminFormSection>

        )}

        {tab === 'processing' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.processing')}>

            <div className="admin-form-grid admin-form-grid--2">

              <AdminFormField label={t('admin.documentsModule.catalog.form.estimatedHours')}>

                <AdminFormInput

                  type="number"

                  min={1}

                  value={cfg.processing.estimatedHours}

                  onChange={(e) =>

                    patchNested('processing', { estimatedHours: Number(e.target.value) || 24 })

                  }

                />

              </AdminFormField>

              <AdminFormField label={t('admin.documentsModule.catalog.form.slaHours')}>

                <AdminFormInput

                  type="number"

                  min={1}

                  value={cfg.processing.slaHours}

                  onChange={(e) => patchNested('processing', { slaHours: Number(e.target.value) || 48 })}

                />

              </AdminFormField>

              <AdminFormField label={t('admin.documentsModule.catalog.form.escalationHours')} className="admin-form-grid__full">

                <AdminFormInput

                  type="number"

                  value={cfg.processing.escalationHours}

                  onChange={(e) =>

                    patchNested('processing', { escalationHours: Number(e.target.value) || 36 })

                  }

                />

              </AdminFormField>

            </div>

            <AdminToggle

              id="svc-escalation"

              label={t('admin.documentsModule.catalog.form.toggles.autoEscalation')}

              checked={cfg.processing.autoEscalation}

              onChange={(autoEscalation) => patchNested('processing', { autoEscalation })}

            />

          </AdminFormSection>

        )}



        {tab === 'delivery' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.delivery')}>

            <div className="admin-doc-studio-split">

              <div className="admin-doc-studio-split__block">

                <h4 className="admin-doc-studio-split__title">{t('admin.documentsModule.catalog.form.onlineDelivery')}</h4>

                <motion.div className="admin-doc-studio-toggle-grid">

                  <AdminToggle

                    id="del-online"

                    label={t('admin.documentsModule.catalog.form.toggles.onlineEnabled')}

                    checked={cfg.delivery.online.enabled}

                    onChange={(enabled) => patchNested('delivery', { online: { ...cfg.delivery.online, enabled } })}

                  />

                  <AdminToggle

                    id="del-pdf"

                    label={t('admin.documentsModule.catalog.form.toggles.downloadPdf')}

                    checked={cfg.delivery.online.downloadablePdf}

                    onChange={(downloadablePdf) =>

                      patchNested('delivery', { online: { ...cfg.delivery.online, downloadablePdf } })

                    }

                  />

                  <AdminToggle

                    id="del-email"

                    label={t('admin.documentsModule.catalog.form.toggles.emailDelivery')}

                    checked={cfg.delivery.online.emailDelivery}

                    onChange={(emailDelivery) =>

                      patchNested('delivery', { online: { ...cfg.delivery.online, emailDelivery } })

                    }

                  />

                </motion.div>

              </div>

              <div className="admin-doc-studio-split__block">

                <h4 className="admin-doc-studio-split__title">{t('admin.documentsModule.catalog.form.physicalDelivery')}</h4>

                <div className="admin-doc-studio-toggle-grid">

                  <AdminToggle

                    id="del-physical"

                    label={t('admin.documentsModule.catalog.form.toggles.physicalEnabled')}

                    checked={cfg.delivery.physical.enabled}

                    onChange={(enabled) =>

                      patchNested('delivery', { physical: { ...cfg.delivery.physical, enabled } })

                    }

                  />

                  <AdminToggle

                    id="del-reserve"

                    label={t('admin.documentsModule.catalog.form.toggles.reservationRequired')}

                    checked={cfg.delivery.physical.reservationRequired}

                    onChange={(reservationRequired) =>

                      patchNested('delivery', { physical: { ...cfg.delivery.physical, reservationRequired } })

                    }

                  />

                  <AdminToggle

                    id="del-sign"

                    label={t('admin.documentsModule.catalog.form.toggles.signatureRequired')}

                    checked={cfg.delivery.physical.signatureRequired}

                    onChange={(signatureRequired) =>

                      patchNested('delivery', { physical: { ...cfg.delivery.physical, signatureRequired } })

                    }

                  />

                </div>

              </div>

            </div>

          </AdminFormSection>

        )}



        {tab === 'pickup' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.pickup')}>

            <div className="admin-form-grid admin-form-grid--2">

              <AdminFormField label={t('admin.documentsModule.catalog.form.pickupOffice')}>

                <AdminFormInput

                  value={cfg.pickup.pickupOffice}

                  onChange={(e) => patchNested('pickup', { pickupOffice: e.target.value })}

                />

              </AdminFormField>

              <AdminFormField label={t('admin.documentsModule.catalog.form.responsibleService')}>

                <AdminFormInput

                  value={cfg.pickup.responsibleService}

                  onChange={(e) => patchNested('pickup', { responsibleService: e.target.value })}

                />

              </AdminFormField>

              <AdminFormField label={t('admin.documentsModule.catalog.form.openingHours')}>

                <AdminFormInput

                  value={cfg.pickup.openingHours}

                  onChange={(e) => patchNested('pickup', { openingHours: e.target.value })}

                />

              </AdminFormField>

              <AdminFormField label={t('admin.documentsModule.catalog.form.maxReservations')}>

                <AdminFormInput

                  type="number"

                  value={cfg.pickup.maxReservationsPerDay}

                  onChange={(e) =>

                    patchNested('pickup', { maxReservationsPerDay: Number(e.target.value) || 20 })

                  }

                />

              </AdminFormField>

            </div>

          </AdminFormSection>

        )}



        {tab === 'validation' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.validation')}>

            <div className="admin-doc-studio-toggle-grid">

              <AdminToggle

                id="val-auto"

                label={t('admin.documentsModule.catalog.form.toggles.automaticValidation')}

                checked={cfg.validation.automatic}

                onChange={(automatic) => patchNested('validation', { automatic })}

              />

              <AdminToggle

                id="val-manual"

                label={t('admin.documentsModule.catalog.form.toggles.manualValidation')}

                checked={cfg.validation.manual}

                onChange={(manual) => patchNested('validation', { manual })}

              />

              <AdminToggle

                id="val-srf"

                label={t('admin.documentsModule.catalog.form.toggles.srfRequired')}

                checked={cfg.validation.srfClearanceRequired}

                onChange={(srfClearanceRequired) => patchNested('validation', { srfClearanceRequired })}

              />

              <AdminToggle

                id="val-multi"

                label={t('admin.documentsModule.catalog.form.toggles.multiStep')}

                checked={cfg.validation.multiStep}

                onChange={(multiStep) => patchNested('validation', { multiStep })}

              />

            </div>

          </AdminFormSection>

        )}



        {tab === 'attachments' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.attachments')}>

            {cfg.requiredAttachments.length === 0 ? (

              <ServiceCatalogStudioEmpty

                icon={Paperclip}

                title={t(`${P}.empty.attachments.title`)}

                description={t(`${P}.empty.attachments.description`)}

              />

            ) : (

              <p className="text-sm text-[var(--admin-text-secondary)]">

                {t('admin.documentsModule.catalog.form.sections.attachmentsHint')}

              </p>

            )}

          </AdminFormSection>

        )}



        {tab === 'fields' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.fields')}>

            {cfg.dynamicFields.length === 0 ? (

              <ServiceCatalogStudioEmpty

                icon={FormInput}

                title={t(`${P}.empty.fields.title`)}

                description={t(`${P}.empty.fields.description`)}

              />

            ) : (

              <p className="text-sm text-[var(--admin-text-secondary)]">

                {t('admin.documentsModule.catalog.form.sections.fieldsHint')}

              </p>

            )}

          </AdminFormSection>

        )}



        {tab === 'workflow' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.workflow')}>

            <p className="admin-doc-studio-panel__hint">{t(`${P}.workflowHint`)}</p>

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

        )}



        {tab === 'automation' && (

          <AdminFormSection title={t('admin.documentsModule.catalog.form.sections.automation')}>

            <p className="admin-doc-studio-panel__hint">

              {t('admin.documentsModule.catalog.form.sections.automationHint')}

            </p>

            <div className="admin-doc-studio-toggle-grid">

              <AdminToggle

                id="auto-remind"

                label={t('admin.documentsModule.catalog.form.toggles.reminders')}

                checked={cfg.automation.reminders}

                onChange={(reminders) => patchNested('automation', { reminders })}

              />

              <AdminToggle

                id="auto-esc"

                label={t('admin.documentsModule.catalog.form.toggles.escalation')}

                checked={cfg.automation.escalation}

                onChange={(escalation) => patchNested('automation', { escalation })}

              />

              <AdminToggle

                id="auto-notif"

                label={t('admin.documentsModule.catalog.form.toggles.notifications')}

                checked={cfg.automation.notifications}

                onChange={(notifications) => patchNested('automation', { notifications })}

              />

            </div>

          </AdminFormSection>

        )}

      </motion.div>

    </AnimatePresence>

  );



  return (

    <div className="admin-doc-studio">

      <ServiceCatalogStudioHero

        value={value}

        isEdit={isEdit}

        completedSteps={completedSteps}

        totalSteps={STUDIO_STEPS.length}

      />

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

            disabled={!value.name.trim() || !value.code.trim()}

          />

        </div>



        <div className="admin-doc-studio__preview-col">

          <ServiceCatalogStudioPreview value={value} />

        </div>

      </div>

    </div>

  );

};



export default ServiceCatalogForm;


