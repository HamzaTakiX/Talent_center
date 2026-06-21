import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AcademicStructureCatalog } from '../catalog/academicStructureCatalog';
import {
  getAcademicStructureCatalog,
  subscribeAcademicStructureCatalog,
} from '../catalog/academicStructureCatalog';
import { useAcademicStructureCatalogContext } from '../context/AcademicStructureCatalogContext';

const EMPTY_LABELS = {
  programs: [] as string[],
  classes: [] as string[],
  academicLevels: [] as string[],
  internshipTypes: [] as string[],
};

/**
 * Shared academic structure from admin settings (filieres, levels, classes).
 * Stays in sync when settings are updated via `invalidateAcademicStructureCatalog`.
 */
export function useAcademicStructureCatalog() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'fr';
  const provider = useAcademicStructureCatalogContext();

  const [fallbackCatalog, setFallbackCatalog] = useState<AcademicStructureCatalog | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [version, setVersion] = useState(0);

  const useFallback = !provider;

  useEffect(() => {
    if (!useFallback) return;

    let cancelled = false;
    setFallbackLoading(true);
    setFallbackError(false);

    void getAcademicStructureCatalog(lang)
      .then((catalog) => {
        if (!cancelled) setFallbackCatalog(catalog);
      })
      .catch(() => {
        if (!cancelled) {
          setFallbackCatalog(null);
          setFallbackError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setFallbackLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, useFallback, version]);

  useEffect(() => {
    if (!useFallback) return;
    return subscribeAcademicStructureCatalog(() => {
      setVersion((v) => v + 1);
    });
  }, [useFallback]);

  const catalog = provider?.catalog ?? fallbackCatalog;
  const loading = provider ? provider.loading : fallbackLoading;
  const error = provider ? provider.error : fallbackError;

  return {
    catalog,
    loading,
    error,
    programs: catalog?.programLabels ?? EMPTY_LABELS.programs,
    classes: catalog?.classLabels ?? EMPTY_LABELS.classes,
    academicLevels: catalog?.academicLevelLabels ?? EMPTY_LABELS.academicLevels,
    internshipTypes: catalog?.internshipTypeLabels ?? EMPTY_LABELS.internshipTypes,
    filieres: catalog?.filieres ?? [],
    levels: catalog?.levels ?? [],
    classGroups: catalog?.classGroups ?? [],
    refresh: provider?.refresh,
    invalidate: provider?.invalidate,
  };
}

export { invalidateAcademicStructureCatalog } from '../catalog/academicStructureCatalog';
