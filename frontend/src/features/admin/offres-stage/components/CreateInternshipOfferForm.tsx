import { FormEvent, FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, FileText } from 'lucide-react';
import AdminSelect from '../../account/components/AdminSelect';
import {
  AdminFormDateInput,
  AdminFormField,
  AdminFormInput,
  AdminFormTextarea,
} from '../../shared/forms/AdminFormPrimitives';
import {
  adminFormActionsClass,
  adminFormBodyClass,
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
  adminFormHeaderClass,
  adminFormPanelClass,
  adminFormSubtitleClass,
  adminFormTitleClass,
} from '../../shared/forms/adminFormClasses';
import { OFFER_TYPE_OPTIONS } from '../constants/createInternshipOffer';

const FORM_PREFIX = 'admin.forms.createOffer';

interface CreateInternshipOfferFormProps {
  onCancel: () => void;
  onPublish: () => void;
}

const CreateInternshipOfferForm: FunctionComponent<CreateInternshipOfferFormProps> = ({
  onCancel,
  onPublish,
}) => {
  const { t } = useTranslation();
  const [offerTitle, setOfferTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [offerType, setOfferType] = useState('');
  const [deadline, setDeadline] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [tags, setTags] = useState('');

  const typeOptions = useMemo(
    () =>
      OFFER_TYPE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`${FORM_PREFIX}.types.${opt.labelKey}`),
      })),
    [t]
  );

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    onPublish();
  };

  return (
    <form className={adminFormPanelClass} onSubmit={handlePublish} noValidate>
      <div className={adminFormBodyClass}>
        <header className={adminFormHeaderClass}>
          <h1 className={adminFormTitleClass}>{t(`${FORM_PREFIX}.title`)}</h1>
          <p className={adminFormSubtitleClass}>{t(`${FORM_PREFIX}.subtitle`)}</p>
        </header>

        <div className={adminFormGridClass}>
          <AdminFormField label={t(`${FORM_PREFIX}.fields.offerTitle`)} htmlFor="offer-title" required>
            <AdminFormInput
              id="offer-title"
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.offerTitle`)}
              required
            />
          </AdminFormField>

          <AdminFormField label={t(`${FORM_PREFIX}.fields.company`)} htmlFor="company" required>
            <AdminFormInput
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.company`)}
              autoComplete="organization"
              required
            />
          </AdminFormField>

          <AdminFormField label={t(`${FORM_PREFIX}.fields.location`)} htmlFor="location" required>
            <AdminFormInput
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

          <AdminFormField label={t(`${FORM_PREFIX}.fields.deadline`)} htmlFor="deadline" required>
            <AdminFormDateInput
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </AdminFormField>

          <AdminFormField label={t(`${FORM_PREFIX}.fields.duration`)} htmlFor="duration">
            <AdminFormInput
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={t(`${FORM_PREFIX}.placeholders.duration`)}
            />
          </AdminFormField>
        </div>

        <AdminFormField
          className="mt-6"
          label={t(`${FORM_PREFIX}.fields.description`)}
          htmlFor="description"
          required
        >
          <AdminFormTextarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t(`${FORM_PREFIX}.placeholders.description`)}
            rows={4}
            required
          />
        </AdminFormField>

        <AdminFormField
          className="mt-6"
          label={t(`${FORM_PREFIX}.fields.skills`)}
          htmlFor="skills"
          required
          hint={t(`${FORM_PREFIX}.hints.skills`)}
        >
          <AdminFormInput
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
      </div>

      <div className={adminFormActionsClass}>
        <button type="button" onClick={onCancel} className={adminFormBtnSecondaryClass}>
          <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t(`${FORM_PREFIX}.actions.draft`)}
        </button>
        <button type="submit" className={adminFormBtnPrimaryClass}>
          <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          {t(`${FORM_PREFIX}.actions.publish`)}
        </button>
      </div>
    </form>
  );
};

export default CreateInternshipOfferForm;
