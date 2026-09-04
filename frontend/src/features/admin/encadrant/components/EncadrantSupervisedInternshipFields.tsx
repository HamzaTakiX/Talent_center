import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { academicReferenceApi } from '../../api/reference';
import type { InternshipTypeOption } from '../../api/types';
import AdminDerivedFieldCard from '../../shared/forms/AdminDerivedFieldCard';
import AdminTagMultiSelect, { type TagOption } from '../../shared/forms/AdminTagMultiSelect';

const PREFIX = 'admin.forms.createEncadrant.supervisedInternships';
const SCOPE_PREFIX = 'admin.forms.createEncadrant.academicScope';

export interface EncadrantSupervisedInternshipState {
  supervisedInternshipTypeIds: number[];
}

interface EncadrantSupervisedInternshipFieldsProps {
  value: EncadrantSupervisedInternshipState;
  onChange: (next: EncadrantSupervisedInternshipState) => void;
  /** Levels selected in academic scope — types come from Structure académique for these levels. */
  levelIds: number[];
  error?: string;
}

const EncadrantSupervisedInternshipFields: FunctionComponent<
  EncadrantSupervisedInternshipFieldsProps
> = ({ value, onChange, levelIds, error }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [options, setOptions] = useState<InternshipTypeOption[]>([]);
  const [loading, setLoading] = useState(false);

  const levelIdsKey = levelIds.join(',');
  const hasLevels = levelIds.length > 0;

  useEffect(() => {
    if (!hasLevels) {
      setOptions([]);
      if (value.supervisedInternshipTypeIds.length > 0) {
        onChange({ supervisedInternshipTypeIds: [] });
      }
      return;
    }

    let cancelled = false;
    setLoading(true);
    academicReferenceApi
      .listInternshipTypes({ level_ids: levelIds, lang })
      .then((types) => {
        if (cancelled) return;
        setOptions(types);
        const allowed = new Set(types.map((item) => item.id));
        const nextIds = value.supervisedInternshipTypeIds.filter((id) => allowed.has(id));
        if (nextIds.length !== value.supervisedInternshipTypeIds.length) {
          onChange({ supervisedInternshipTypeIds: nextIds });
        }
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIdsKey, lang]);

  useEffect(() => {
    if (options.length !== 1 || !hasLevels) return;
    const soleId = options[0].id;
    if (value.supervisedInternshipTypeIds.length === 1 && value.supervisedInternshipTypeIds[0] === soleId) {
      return;
    }
    onChange({ supervisedInternshipTypeIds: [soleId] });
  }, [options, hasLevels, value.supervisedInternshipTypeIds, onChange]);

  const tagOptions: TagOption[] = useMemo(
    () =>
      options.map((item) => {
        const name = (item.name || '').trim();
        const hint = (item.duration_hint || '').trim();
        const label =
          hint && !name.toLowerCase().includes(`(${hint.toLowerCase()})`)
            ? `${name} (${hint})`
            : name;
        return { value: String(item.id), label };
      }),
    [options],
  );

  const formatInternshipLabel = (item: InternshipTypeOption) => {
    const name = (item.name || '').trim();
    const hint = (item.duration_hint || '').trim();
    return hint && !name.toLowerCase().includes(`(${hint.toLowerCase()})`)
      ? `${name} (${hint})`
      : name;
  };

  const singleResolvedLabel =
    options.length === 1 ? formatInternshipLabel(options[0]) : '';

  if (hasLevels && options.length === 1) {
    return (
      <AdminDerivedFieldCard
        id="enc-supervised-internship-auto"
        label={t(`${PREFIX}.label`)}
        hint={t(`${PREFIX}.autoHint`)}
        autoBadge
        compact
        status={loading ? 'loading' : 'resolved'}
        value={singleResolvedLabel}
        error={error}
      />
    );
  }

  return (
    <AdminDerivedFieldCard
      id="enc-supervised-internship-types-card"
      label={t(`${PREFIX}.label`)}
      hint={hasLevels ? t(`${PREFIX}.hint`) : t(`${SCOPE_PREFIX}.needsLevel`)}
      compact
      status={!hasLevels ? 'empty' : loading ? 'loading' : options.length === 0 ? 'empty' : 'idle'}
      emptyLabel={hasLevels ? t(`${PREFIX}.emptyForLevels`) : t(`${SCOPE_PREFIX}.needsLevel`)}
      error={error}
    >
      <AdminTagMultiSelect
        id="enc-supervised-internship-types"
        label=""
        values={value.supervisedInternshipTypeIds.map(String)}
        options={tagOptions}
        onChange={(ids) =>
          onChange({
            supervisedInternshipTypeIds: ids.map(Number).filter(Boolean),
          })
        }
        loading={loading}
        searchable={tagOptions.length > 6}
        required
        disabled={!hasLevels}
        disabledHint={t(`${SCOPE_PREFIX}.needsLevel`)}
        placeholder={
          hasLevels ? t(`${PREFIX}.placeholder`) : t(`${SCOPE_PREFIX}.needsLevel`)
        }
      />
    </AdminDerivedFieldCard>
  );
};

export default EncadrantSupervisedInternshipFields;
