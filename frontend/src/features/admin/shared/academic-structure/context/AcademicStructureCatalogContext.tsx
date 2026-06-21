import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { AcademicStructureCatalog } from '../catalog/academicStructureCatalog';
import {
  getAcademicStructureCatalog,
  invalidateAcademicStructureCatalog,
  subscribeAcademicStructureCatalog,
} from '../catalog/academicStructureCatalog';

interface AcademicStructureCatalogContextValue {
  catalog: AcademicStructureCatalog | null;
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
  invalidate: () => void;
}

const AcademicStructureCatalogContext = createContext<AcademicStructureCatalogContextValue | null>(
  null,
);

export const AcademicStructureCatalogProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || 'fr';
  const [catalog, setCatalog] = useState<AcademicStructureCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [version, setVersion] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const next = await getAcademicStructureCatalog(lang);
      setCatalog(next);
    } catch {
      setCatalog(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    void load();
  }, [load, version]);

  useEffect(() => {
    return subscribeAcademicStructureCatalog(() => {
      setVersion((v) => v + 1);
    });
  }, []);

  const invalidate = useCallback(() => {
    invalidateAcademicStructureCatalog();
  }, []);

  const refresh = useCallback(async () => {
    invalidateAcademicStructureCatalog();
    await load();
  }, [load]);

  const value = useMemo(
    (): AcademicStructureCatalogContextValue => ({
      catalog,
      loading,
      error,
      refresh,
      invalidate,
    }),
    [catalog, loading, error, refresh, invalidate],
  );

  return (
    <AcademicStructureCatalogContext.Provider value={value}>
      {children}
    </AcademicStructureCatalogContext.Provider>
  );
};

export function useAcademicStructureCatalogContext(): AcademicStructureCatalogContextValue | null {
  return useContext(AcademicStructureCatalogContext);
}
