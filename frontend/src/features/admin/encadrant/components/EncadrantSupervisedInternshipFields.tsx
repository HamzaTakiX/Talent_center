import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { academicReferenceApi } from '../../api/reference';
import type { InternshipTypeOption } from '../../api/types';
import AdminTagMultiSelect, { type TagOption } from '../../shared/forms/AdminTagMultiSelect';

const PREFIX = 'admin.forms.createEncadrant.supervisedInternships';

export interface EncadrantSupervisedInternshipState {
  supervisedInternshipTypeIds: number[];
}

interface EncadrantSupervisedInternshipFieldsProps {
  value: EncadrantSupervisedInternshipState;
  onChange: (next: EncadrantSupervisedInternshipState) => void;
  error?: string;
}

const EncadrantSupervisedInternshipFields: FunctionComponent<
  EncadrantSupervisedInternshipFieldsProps
> = ({ value, onChange, error }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [options, setOptions] = useState<InternshipTypeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    academicReferenceApi
      .listAllInternshipTypes({ lang })
      .then(setOptions)
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
  }, [lang]);

  const tagOptions: TagOption[] = useMemo(
    () =>
      options.map((item) => ({
        value: String(item.id),
        label: item.duration_hint ? `${item.name} (${item.duration_hint})` : item.name,
      })),
    [options],
  );

  return (
    <AdminTagMultiSelect
      id="enc-supervised-internship-types"
      label={t(`${PREFIX}.label`)}
      hint={t(`${PREFIX}.hint`)}
      values={value.supervisedInternshipTypeIds.map(String)}
      options={tagOptions}
      onChange={(ids) =>
        onChange({
          supervisedInternshipTypeIds: ids.map(Number).filter(Boolean),
        })
      }
      loading={loading}
      searchable
      required
      error={error}
      placeholder={t(`${PREFIX}.placeholder`)}
    />
  );
};

export default EncadrantSupervisedInternshipFields;
