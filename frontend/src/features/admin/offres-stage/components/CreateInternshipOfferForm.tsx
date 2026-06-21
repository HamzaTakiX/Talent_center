import { FormEvent, FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, FileText } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import { useOfferBasicInfoOptions } from '../../shared/hooks/useAcademicReferenceOptions';
import {
  AdminFormDateInput,
  AdminFormField,
  AdminFormInput,
  AdminFormTextarea,
} from '../../shared/forms/AdminFormPrimitives';
import AdminFormPanelHeader from '../../shared/forms/AdminFormPanelHeader';
import AdminFormSection from '../../shared/forms/AdminFormSection';
import {
  adminFormActionsFooterClass,
  adminFormBodyScrollClass,
  adminFormPanelFlexClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormSectionsStackClass,
} from '../../shared/forms/adminFormClasses';
import { OFFER_TYPE_OPTIONS } from '../constants/createInternshipOffer';

const FORM_PREFIX = 'admin.forms.createOffer';

export interface InternshipOfferFormValues {
  offerTitle: string;
  company: string;
  location: string;
  offerType: string;
  deadline: string;
  duration: string;
  description: string;
  skills: string;
  tags: string;
}

interface CreateInternshipOfferFormProps {
  variant?: 'create' | 'edit';
  initialValues?: Partial<InternshipOfferFormValues>;
  hidePanelHeader?: boolean;
  onCancel: () => void;
  onPublish: () => void;
  onSubmit?: (values: InternshipOfferFormValues) => void;
  submitDisabled?: boolean;
}

const CreateInternshipOfferForm: FunctionComponent<CreateInternshipOfferFormProps> = ({
  variant = 'create',
  initialValues,
  hidePanelHeader = false,
  onCancel,
  onPublish,
  onSubmit,
  submitDisabled = false,
}) => {
  const { t } = useTranslation();
  const { internshipTypeOptions } = useOfferBasicInfoOptions();
  const [offerTitle, setOfferTitle] = useState(initialValues?.offerTitle ?? '');
  const [company, setCompany] = useState(initialValues?.company ?? '');
  const [location, setLocation] = useState(initialValues?.location ?? '');
  const [offerType, setOfferType] = useState(initialValues?.offerType ?? '');
  const [deadline, setDeadline] = useState(initialValues?.deadline ?? '');
  const [duration, setDuration] = useState(initialValues?.duration ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [skills, setSkills] = useState(initialValues?.skills ?? '');
  const [tags, setTags] = useState(initialValues?.tags ?? '');

  const typeOptions = useMemo(() => {
    if (internshipTypeOptions.length > 0) {
      return [
        { value: '', label: t(`${FORM_PREFIX}.types.select`) },
        ...internshipTypeOptions,
      ];
    }
    return OFFER_TYPE_OPTIONS.map((opt) => ({
      value: opt.value,
      label: t(`${FORM_PREFIX}.types.${opt.labelKey}`),
    }));
  }, [internshipTypeOptions, t]);

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    const values: InternshipOfferFormValues = {
      offerTitle,
      company,
      location,
      offerType,
      deadline,
      duration,
      description,
      skills,
      tags,
    };
    if (onSubmit) {
      onSubmit(values);
      return;
    }
    onPublish();
  };

  const formTitle =
    variant === 'edit'
      ? t(`${FORM_PREFIX}.editTitle`)
      : t(`${FORM_PREFIX}.title`);
  const formSubtitle =
    variant === 'edit' ? t(`${FORM_PREFIX}.editSubtitle`) : t(`${FORM_PREFIX}.subtitle`);

  return (
    <form className={adminFormPanelFlexClass} onSubmit={handlePublish} noValidate>
      {!hidePanelHeader && <AdminFormPanelHeader title={formTitle} subtitle={formSubtitle} />}

      <div className={adminFormBodyScrollClass}>
        <div className={adminFormSectionsStackClass}>
        <AdminFormSection
          sectionKey="offer"
          title={t(`${FORM_PREFIX}.sections.details`)}
          description={t(`${FORM_PREFIX}.sections.detailsHint`)}
        >
        <div className={adminFormGridClass}>
          <AdminFormField fieldKey="offerTitle" label={t(`${FORM_PREFIX}.fields.offerTitle`)} htmlFor="offer-title" required>
            <AdminFormInput
              fieldKey="offerTitle"
              id="offer-title"
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.offerTitle`)}
              required
            />
          </AdminFormField>

          <AdminFormField fieldKey="company" label={t(`${FORM_PREFIX}.fields.company`)} htmlFor="company" required>
            <AdminFormInput
              fieldKey="company"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.company`)}
              autoComplete="organization"
              required
            />
          </AdminFormField>

          <AdminFormField fieldKey="location" label={t(`${FORM_PREFIX}.fields.location`)} htmlFor="location" required>
            <AdminFormInput
              fieldKey="location"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.location`)}
              required
            />
          </AdminFormField>

          <AdminSelect
            id="offer-type"
            label={`${t(`${FORM_PREFIX}.fields.offerType`)} *`}
            value={offerType}
            onChange={setOfferType}
            options={typeOptions}
          />

          <AdminFormField fieldKey="deadline" label={t(`${FORM_PREFIX}.fields.deadline`)} htmlFor="deadline" required>
            <AdminFormDateInput
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </AdminFormField>

          <AdminFormField fieldKey="duration" label={t(`${FORM_PREFIX}.fields.duration`)} htmlFor="duration">
            <AdminFormInput
              fieldKey="duration"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.duration`)}
            />
          </AdminFormField>
        </div>
        </AdminFormSection>

        <AdminFormSection
          sectionKey="content"
          title={t(`${FORM_PREFIX}.sections.content`)}
          description={t(`${FORM_PREFIX}.sections.contentHint`)}
        >
          <AdminFormField
            fieldKey="message"
            label={t(`${FORM_PREFIX}.fields.description`)}
            htmlFor="description"
            required
          >
            <AdminFormTextarea
              fieldKey="message"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.description`)}
              rows={4}
              required
            />
          </AdminFormField>

          <AdminFormField
            fieldKey="skills"
            className="mt-6"
            label={t(`${FORM_PREFIX}.fields.skills`)}
            htmlFor="skills"
            required
            hint={t(`${FORM_PREFIX}.hints.skills`)}
          >
            <AdminFormInput
              fieldKey="skills"
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.skills`)}
              required
            />
          </AdminFormField>

          <AdminFormField
            className="mt-6"
            label={t(`${FORM_PREFIX}.fields.tags`)}
            htmlFor="tags"
            hint={t(`${FORM_PREFIX}.hints.tags`)}
          >
            <AdminFormInput
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.tags`)}
            />
          </AdminFormField>
        </AdminFormSection>
        </div>
      </div>

      <div className={adminFormActionsFooterClass}>
        <button type="button" onClick={onCancel} className={adminFormBtnSecondaryClass}>
          <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {variant === 'edit'
            ? t(`${FORM_PREFIX}.actions.cancel`)
            : t(`${FORM_PREFIX}.actions.draft`)}
        </button>
        <button type="submit" className={adminFormBtnPrimaryClass} disabled={submitDisabled}>
          <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {variant === 'edit' ? t(`${FORM_PREFIX}.actions.save`) : t(`${FORM_PREFIX}.actions.publish`)}
        </button>
      </div>
    </form>
  );
};

export default CreateInternshipOfferForm;
