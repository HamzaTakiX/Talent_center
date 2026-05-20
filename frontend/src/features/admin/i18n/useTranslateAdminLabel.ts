import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ADMIN_KPI_LABEL_TO_KEY } from './adminKpiLabelMap';

/** Resolves a KPI label from an explicit key, a legacy English label map, or the raw string. */
export function useTranslateAdminLabel() {
  const { t, i18n } = useTranslation();

  return useCallback(
    (label: string, labelKey?: string): string => {
      const rawKey = labelKey ?? ADMIN_KPI_LABEL_TO_KEY[label];
      if (!rawKey) return label;
      const key = rawKey.startsWith('admin.')
        ? rawKey
        : `admin.kpi.${rawKey}`;
      const translated = t(key);
      return translated === key ? label || rawKey : translated;
    },
    [t, i18n.language]
  );
}
