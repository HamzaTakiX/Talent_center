import { FormEvent, FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';
import AdminModal from '../../ui/AdminModal';
import {
  AdminFormField,
  AdminFormInput,
  AdminFormTextarea,
} from '../../shared/forms/AdminFormPrimitives';
import AdminFormSwitch from '../../shared/forms/AdminFormSwitch';
import {
  adminFormBtnPrimaryClass,
  adminFormBtnSecondaryClass,
  adminFormGridClass,
} from '../../shared/forms/adminFormClasses';
import AdminSelect from '../../account/components/AdminSelect';
import type { AnnouncementTypeItem, AnnouncementTypeWritePayload } from '../types/announcement';
import AnnouncementTypeIconPicker from './AnnouncementTypeIconPicker';
import { resolveAnnouncementTypeIcon } from '../utils/announcementTypeIcons';
import '../styles/admin-announcements.css';
const P = 'admin.announcementsModule.types.form';

const PRIORITY_OPTIONS = [
  'NORMAL',
  'IMPORTANT',
  'URGENT',
  'PINNED',
  'INSTITUTIONAL_CRITICAL',
] as const;

export interface AnnouncementTypeFormValues {
  code: string;
  name_fr: string;
  name_en: string;
  name_ar: string;
  description: string;
  icon: string;
  color: string;
  default_priority: string;
  is_active: boolean;
  is_mutable: boolean;
  is_bannable: boolean;
  is_internship_related: boolean;
  recommendation_weight: string;
}

const emptyValues = (): AnnouncementTypeFormValues => ({
  code: '',
  name_fr: '',
  name_en: '',
  name_ar: '',
  description: '',
  icon: 'megaphone',
  color: '#2563eb',
  default_priority: 'NORMAL',
  is_active: true,
  is_mutable: true,
  is_bannable: true,
  is_internship_related: false,
  recommendation_weight: '1.0',
});

function slugifyCode(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fromItem(item: AnnouncementTypeItem): AnnouncementTypeFormValues {
  const i18n = item.name_i18n ?? {};
  return {
    code: item.code,
    name_fr: i18n.fr ?? item.name,
    name_en: i18n.en ?? item.name,
    name_ar: i18n.ar ?? item.name,
    description: item.description ?? '',
    icon: item.icon ?? 'megaphone',
    color: item.color || '#2563eb',
    default_priority: item.default_priority,
    is_active: item.is_active,
    is_mutable: item.is_mutable,
    is_bannable: item.is_bannable,
    is_internship_related: item.is_internship_related,
    recommendation_weight: item.recommendation_weight ?? '1.0',
  };
}

function toPayload(values: AnnouncementTypeFormValues): AnnouncementTypeWritePayload {
  const name = values.name_fr || values.name_en || values.name_ar;
  return {
    code: values.code,
    name,
    name_i18n: {
      fr: values.name_fr,
      en: values.name_en,
      ar: values.name_ar,
    },
    description: values.description,
    icon: values.icon,
    color: values.color,
    default_priority: values.default_priority,
    is_active: values.is_active,
    is_mutable: values.is_mutable,
    is_bannable: values.is_bannable,
    is_internship_related: values.is_internship_related,
    recommendation_weight: values.recommendation_weight,
  };
}

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  item?: AnnouncementTypeItem | null;
  onClose: () => void;
  onSubmit: (payload: AnnouncementTypeWritePayload) => Promise<void>;
}

const AnnouncementTypeFormDialog: FunctionComponent<Props> = ({
  open,
  mode,
  item,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [values, setValues] = useState<AnnouncementTypeFormValues>(emptyValues);
  const [submitting, setSubmitting] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCodeTouched(false);
    setValues(mode === 'edit' && item ? fromItem(item) : emptyValues());
  }, [open, mode, item]);

  const priorityOptions = useMemo(
    () =>
      PRIORITY_OPTIONS.map((p) => ({
        value: p,
        label: t(`admin.announcementsModule.types.priorities.${p}`),
      })),
    [t],
  );

  const set = <K extends keyof AnnouncementTypeFormValues>(key: K, val: AnnouncementTypeFormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      if (key === 'name_fr' && mode === 'create' && !codeTouched) {
        next.code = slugifyCode(String(val));
      }
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(toPayload(values));
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isSystemEdit = mode === 'edit' && item?.is_system;

  const HeaderIcon = mode === 'create' ? Layers : resolveAnnouncementTypeIcon(values.icon);
  const headerIconColor = mode === 'create' ? undefined : values.color;

  const footer = (    <>
      <button type="button" className={adminFormBtnSecondaryClass} onClick={onClose} disabled={submitting}>
        {t('common.cancel')}
      </button>
      <button
        type="submit"
        form="announcement-type-form"
        className={adminFormBtnPrimaryClass}
        disabled={submitting}
      >
        {submitting ? '…' : t(mode === 'create' ? `${P}.create` : `${P}.save`)}
      </button>
    </>
  );

  return (
    <AdminModal
      open={open}
      onClose={onClose}
      title={t(mode === 'create' ? `${P}.createTitle` : `${P}.editTitle`)}
      description={t(`${P}.description`)}
      maxWidthClass="max-w-[760px]"
      headerIcon={HeaderIcon}
      headerIconColor={headerIconColor}
      footer={footer}
    >      <form id="announcement-type-form" className="flex flex-col gap-5" onSubmit={(e) => void handleSubmit(e)}>
        <div className={adminFormGridClass}>
          <AdminFormField htmlFor="ann-type-name-fr" label={t(`${P}.nameFr`)} required>
            <AdminFormInput
              id="ann-type-name-fr"
              value={values.name_fr}
              onChange={(e) => set('name_fr', e.target.value)}
              required
            />
          </AdminFormField>
          <AdminFormField htmlFor="ann-type-name-en" label={t(`${P}.nameEn`)} required>
            <AdminFormInput
              id="ann-type-name-en"
              value={values.name_en}
              onChange={(e) => set('name_en', e.target.value)}
              required
            />
          </AdminFormField>
          <AdminFormField htmlFor="ann-type-name-ar" label={t(`${P}.nameAr`)} required>
            <AdminFormInput
              id="ann-type-name-ar"
              value={values.name_ar}
              onChange={(e) => set('name_ar', e.target.value)}
              required
              dir="rtl"
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="ann-type-code"
            label={t(`${P}.code`)}
            hint={isSystemEdit ? t(`${P}.codeSystemHint`) : t(`${P}.codeHint`)}
            required
          >
            <AdminFormInput
              id="ann-type-code"
              value={values.code}
              onChange={(e) => {
                setCodeTouched(true);
                set('code', slugifyCode(e.target.value));
              }}
              readOnly={isSystemEdit}
              required
            />
          </AdminFormField>
          <AdminSelect
            id="ann-type-priority"
            label={t(`${P}.priority`)}
            value={values.default_priority}
            onChange={(value) => set('default_priority', value)}
            options={priorityOptions}
            required
          />
          <AdminFormField htmlFor="ann-type-weight" label={t(`${P}.weight`)}>
            <AdminFormInput
              id="ann-type-weight"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={values.recommendation_weight}
              onChange={(e) => set('recommendation_weight', e.target.value)}
            />
          </AdminFormField>
        </div>

        <AdminFormField htmlFor="ann-type-desc" label={t(`${P}.descriptionField`)}>
          <AdminFormTextarea
            id="ann-type-desc"
            rows={2}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </AdminFormField>

        <AnnouncementTypeIconPicker
          iconKey={values.icon}
          color={values.color}
          onIconChange={(icon) => set('icon', icon)}
          onColorChange={(color) => set('color', color)}
        />

        <div className="admin-ann-type-options">
          <p className="admin-ann-type-options__title">{t(`${P}.optionsTitle`)}</p>
          {(
            [
              ['is_active', `${P}.active`],
              ['is_mutable', `${P}.mutable`],
              ['is_bannable', `${P}.bannable`],
              ['is_internship_related', `${P}.internship`],
            ] as const
          ).map(([key, labelKey]) => (
            <AdminFormSwitch
              key={key}
              id={`ann-type-${key}`}
              label={t(labelKey)}
              checked={values[key]}
              onChange={(checked) => set(key, checked)}
            />
          ))}
        </div>      </form>
    </AdminModal>
  );
};

export default AnnouncementTypeFormDialog;
