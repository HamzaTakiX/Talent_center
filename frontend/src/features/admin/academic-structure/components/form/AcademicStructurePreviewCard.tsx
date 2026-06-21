import { FunctionComponent } from 'react';
import { Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AcademicStructureTab } from '../../types/academicStructureTypes';
import type { AcademicStructureFormValues } from '../../types/academicStructureFormTypes';
import {
  formatAcademicCode,
  humanizeAcademicLabel,
  humanizeProgramFamily,
  localizedEntityName,
} from '../../utils/academicStructureDisplay';
import { formatDurationLabel } from '../../utils/academicStructureDuration';

const PREFIX = 'admin.modules.academicStructure.form';

interface PreviewContext {
  tab: AcademicStructureTab;
  values: AcademicStructureFormValues;
  trackLabel?: string;
  trackCode?: string;
  levelLabel?: string;
  levelCode?: string;
}

const AcademicStructurePreviewCard: FunctionComponent<PreviewContext> = ({
  tab,
  values,
  trackLabel,
  trackCode,
  levelLabel,
  levelCode,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const displayName =
    localizedEntityName(values, locale) ||
    humanizeAcademicLabel(values.name_en || values.name_fr) ||
    t(`${PREFIX}.preview.placeholderName`);
  const displayCode = formatAcademicCode(values.code);
  const duration = formatDurationLabel(values.duration_value, values.duration_unit, locale);

  return (
    <aside className="academic-form-preview" aria-live="polite">
      <header className="academic-form-preview__header">
        <Eye className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" strokeWidth={1.75} aria-hidden />
        <span>{t(`${PREFIX}.preview.title`)}</span>
      </header>

      <div className="academic-form-preview__card">
        <div className="academic-form-preview__badges">
          {tab === 'tracks' && values.program_family ? (
            <span className="academic-form-preview__badge academic-form-preview__badge--brand">
              {humanizeProgramFamily(values.program_family)}
            </span>
          ) : null}
          {(trackCode || trackLabel) && tab !== 'tracks' ? (
            <span className="academic-form-preview__badge">
              {formatAcademicCode(trackCode) || humanizeAcademicLabel(trackLabel)}
            </span>
          ) : null}
          {(levelCode || levelLabel) &&
          (tab === 'classes' || tab === 'internship-framework' || tab === 'levels') ? (
            <span className="academic-form-preview__badge">
              {formatAcademicCode(levelCode) || humanizeAcademicLabel(levelLabel)}
            </span>
          ) : null}
        </div>

        <p className="academic-form-preview__name">{displayName}</p>

        {displayCode && tab !== 'classes' ? (
          <p className="academic-form-preview__code">{displayCode}</p>
        ) : null}

        {tab === 'internship-framework' ? (
          <p className="academic-form-preview__meta">
            {t(`${PREFIX}.preview.duration`)}: <strong>{duration}</strong>
          </p>
        ) : null}

        {tab === 'classes' && values.academic_year ? (
          <p className="academic-form-preview__meta">
            {t(`${PREFIX}.preview.year`)}: <strong>{values.academic_year}</strong>
          </p>
        ) : null}

        {tab === 'tracks' && values.description ? (
          <p className="academic-form-preview__desc">{values.description}</p>
        ) : null}

        <div className="academic-form-preview__footer">
          <span
            className={`academic-form-preview__status ${
              values.is_active
                ? 'academic-form-preview__status--active'
                : 'academic-form-preview__status--inactive'
            }`}
          >
            {values.is_active
              ? t('admin.modules.academicStructure.status.active')
              : t('admin.modules.academicStructure.status.inactive')}
          </span>
          <span className="academic-form-preview__order">
            #{values.sort_order + 1}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default AcademicStructurePreviewCard;
