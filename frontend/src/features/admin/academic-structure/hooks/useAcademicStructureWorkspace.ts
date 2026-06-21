import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { academicStructureApi } from '../api/academicStructureApi';
import type {
  AcademicClassRow,
  AcademicLevelRow,
  AcademicStructureTab,
  AcademicTrackRow,
  AuditLogEntry,
  InternshipFrameworkRow,
  WorkModeRow,
} from '../types/academicStructureTypes';

export function useAcademicStructureWorkspace(activeTab: AcademicStructureTab) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.slice(0, 2);
  const [tracks, setTracks] = useState<AcademicTrackRow[]>([]);
  const [levels, setLevels] = useState<AcademicLevelRow[]>([]);
  const [classes, setClasses] = useState<AcademicClassRow[]>([]);
  const [internshipTypes, setInternshipTypes] = useState<InternshipFrameworkRow[]>([]);
  const [workModes, setWorkModes] = useState<WorkModeRow[]>([]);
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'archived') {
        const params = { include_archived: true, lang };
        const [t, l, c, i, w] = await Promise.all([
          academicStructureApi.listTracks(params),
          academicStructureApi.listLevels(params),
          academicStructureApi.listClasses(params),
          academicStructureApi.listInternshipFramework(params),
          academicStructureApi.listWorkModes(true, lang),
        ]);
        setTracks(t);
        setLevels(l);
        setClasses(c);
        setInternshipTypes(i);
        setWorkModes(w);
      } else if (activeTab === 'tracks') {
        setTracks(await academicStructureApi.listTracks({ lang }));
      } else if (activeTab === 'levels') {
        const [t, l] = await Promise.all([
          academicStructureApi.listTracks({ lang }),
          academicStructureApi.listLevels({ lang }),
        ]);
        setTracks(t);
        setLevels(l);
      } else if (activeTab === 'classes') {
        const [t, c] = await Promise.all([
          academicStructureApi.listTracks({ lang }),
          academicStructureApi.listClasses({ lang }),
        ]);
        setTracks(t);
        setClasses(c);
      } else if (activeTab === 'internship-framework') {
        const [t, i] = await Promise.all([
          academicStructureApi.listTracks({ lang }),
          academicStructureApi.listInternshipFramework({ lang }),
        ]);
        setTracks(t);
        setInternshipTypes(i);
      } else if (activeTab === 'work-modes') {
        setWorkModes(await academicStructureApi.listWorkModes(false, lang));
      }
      setAudit(await academicStructureApi.getAuditLog(200));
    } catch {
      setError('loadFailed');
    } finally {
      setLoading(false);
    }
  }, [activeTab, lang]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    tracks,
    levels,
    classes,
    internshipTypes,
    workModes,
    audit,
    loading,
    error,
    refresh,
    setTracks,
    setLevels,
    setClasses,
    setInternshipTypes,
    setWorkModes,
  };
}
