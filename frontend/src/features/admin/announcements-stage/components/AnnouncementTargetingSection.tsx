import { FunctionComponent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import AdminTagMultiSelect from '../../shared/forms/AdminTagMultiSelect';
import { useOfferTargetingOptions } from '../../shared/hooks/useAcademicReferenceOptions';
import { getTargetingSelectionCounts } from '../../../shared/utils/targetingMappers';
import type { TargetingRules } from '../../offres-stage/types/createOfferWorkflow';

const PREFIX = 'admin.forms.createOfferStudio.targeting';
const SCOPE_PREFIX = 'admin.forms.academicScope';

interface AnnouncementTargetingSectionProps {
  targeting: TargetingRules;
  audienceSize: number;
  audiencePreviewLoading?: boolean;
  hasTargeting: boolean;
  onChange: (targeting: TargetingRules) => void;
  disabled?: boolean;
}

const AnnouncementTargetingSection: FunctionComponent<AnnouncementTargetingSectionProps> = ({
  targeting,
  audienceSize,
  audiencePreviewLoading = false,
  hasTargeting,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const {
    loading,
    loadError,
    trackOptions,
    classOptionsGrouped,
  } = useOfferTargetingOptions();

  const selectionCounts = useMemo(
    () => getTargetingSelectionCounts(targeting),
    [targeting],
  );

  const countRows = useMemo(
    () =>
      [
        { key: 'programs', count: selectionCounts.programs, label: t(`${PREFIX}.program`) },
        { key: 'classes', count: selectionCounts.classes, label: t(`${PREFIX}.class`) },
      ].filter((row) => row.count > 0),
    [selectionCounts, t],
  );

  const hasAnyOptions =
    trackOptions.length > 0
    || classOptionsGrouped.length > 0;

  const sectionEmptyHint = t(`${PREFIX}.sectionEmpty`, {
    defaultValue: 'No options configured yet.',
  });

  const selectPlaceholder = t(`${SCOPE_PREFIX}.selectPlaceholder`);
  const searchPlaceholder = t(`${SCOPE_PREFIX}.searchPlaceholder`);
  const emptyMessage = t(`${SCOPE_PREFIX}.emptyOptions`);

  const patchTargeting = (patch: Partial<TargetingRules>) => {
    onChange({ ...targeting, ...patch });
  };

  return (
    <div>
      {!loading && !hasAnyOptions ? (
        <p className="offer-targeting-empty mb-4" role="status">
          {loadError
            ? t(`${PREFIX}.loadError`, {
                defaultValue: 'Unable to load academic data. Please refresh the page.',
              })
            : t(`${PREFIX}.noAcademicData`, {
                defaultValue:
                  'No academic programs are configured yet. Add them in Academic Structure first.',
              })}
        </p>
      ) : (
        <div className="offer-targeting-fields">
          <AdminTagMultiSelect
            id="announcement-targeting-programs"
            label={t(`${PREFIX}.program`)}
            values={targeting.programs}
            options={trackOptions}
            onChange={(programs) => patchTargeting({ programs })}
            loading={loading}
            searchable
            disabled={disabled}
            placeholder={selectPlaceholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={trackOptions.length === 0 ? sectionEmptyHint : emptyMessage}
          />
          <AdminTagMultiSelect
            id="announcement-targeting-classes"
            label={t(`${PREFIX}.class`)}
            values={targeting.classes}
            groups={classOptionsGrouped}
            onChange={(classes) => patchTargeting({ classes })}
            loading={loading}
            searchable
            disabled={disabled}
            placeholder={selectPlaceholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={classOptionsGrouped.length === 0 ? sectionEmptyHint : emptyMessage}
          />
        </div>
      )}

      {hasTargeting ? (
        <div className="offer-targeting-summary mt-4" role="status">
          <p className="offer-targeting-summary__title">{t(`${PREFIX}.audienceSummary.title`)}</p>
          <p className="offer-targeting-summary__headline">
            <Users className="h-5 w-5 shrink-0" aria-hidden />
            {audiencePreviewLoading
              ? t(`${PREFIX}.audienceSummary.loading`)
              : audienceSize > 0
                ? t(`${PREFIX}.audienceSummary.eligible`, { count: audienceSize })
                : t(`${PREFIX}.audiencePending`)}
          </p>
          {countRows.length > 0 ? (
            <dl className="offer-targeting-summary__stats">
              {countRows.map((row) => (
                <div key={row.key} className="offer-targeting-summary__stat">
                  <dt>{row.label}</dt>
                  <dd>{row.count}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {!audiencePreviewLoading && audienceSize > 0 ? (
            <p className="offer-targeting-summary__hint">{t(`${PREFIX}.audienceSummary.autoRefresh`)}</p>
          ) : null}
        </div>
      ) : (
        <div className="offer-audience-badge mt-4">
          <Users className="h-4 w-4" aria-hidden />
          {t(`${PREFIX}.audienceEmpty`)}
        </div>
      )}
    </div>
  );
};

export default AnnouncementTargetingSection;
