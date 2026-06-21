import { useEffect, useState } from 'react';
import { academicStructureApi } from '../api/academicStructureApi';
import type { AuditLogEntry } from '../types/academicStructureTypes';

const SETTINGS_AUDIT_LIMIT = 50;

export function useAcademicStructureAudit(enabled: boolean) {
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setAudit([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void academicStructureApi
      .getAuditLog(SETTINGS_AUDIT_LIMIT)
      .then((entries) => {
        if (!cancelled) setAudit(entries);
      })
      .catch(() => {
        if (!cancelled) setAudit([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { audit, loading };
}
