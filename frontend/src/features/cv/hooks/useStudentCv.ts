import { useCallback, useEffect, useRef, useState } from 'react';
import { cvApi } from '../api';
import { CvSection, StudentCv } from '../types';

interface UseStudentCvResult {
  cv: StudentCv | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;

  // Section-level mutators. All update the local cache optimistically and
  // persist via debounced PATCH (updateSection) or immediate POST (others).
  updateSection: (sectionId: number, patch: Partial<CvSection>) => void;
  addSection: (payload: { section_type: CvSection['section_type']; label?: string }) => Promise<void>;
  deleteSection: (sectionId: number) => Promise<void>;
  reorderSections: (orderedIds: number[]) => Promise<void>;

  // CV-level actions.
  switchTemplate: (templateId: number) => Promise<void>;
  makePrimary: () => Promise<void>;

  // AI + export.
  analyze: () => Promise<void>;
  exportPdf: () => Promise<void>;
}

const DEBOUNCE_MS = 600;

/**
 * Single-CV editor hook. Fetches detail, exposes mutators that
 * - apply changes locally (optimistic),
 * - persist via the API (debounced for content edits).
 */
export function useStudentCv(cvId: number | null): UseStudentCvResult {
  const [cv, setCv] = useState<StudentCv | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce table: sectionId -> timer + latest patch.
  const pendingPatchesRef = useRef<Map<number, { timer: number; patch: Partial<CvSection> }>>(
    new Map(),
  );

  const reload = useCallback(async () => {
    if (cvId == null) return;
    setLoading(true);
    setError(null);
    try {
      const fresh = await cvApi.getCv(cvId);
      setCv(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load CV');
    } finally {
      setLoading(false);
    }
  }, [cvId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ---- Section updates (debounced PATCH) ----------------------------------
  const flushSection = useCallback(async (sectionId: number) => {
    const entry = pendingPatchesRef.current.get(sectionId);
    if (!entry) return;
    const patch = entry.patch;
    pendingPatchesRef.current.delete(sectionId);
    try {
      const saved = await cvApi.updateSection(sectionId, patch);
      setCv((prev) =>
        prev
          ? { ...prev, sections: prev.sections.map((s) => (s.id === sectionId ? saved : s)) }
          : prev,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save section');
    }
  }, []);

  const updateSection = useCallback(
    (sectionId: number, patch: Partial<CvSection>) => {
      setCv((prev) =>
        prev
          ? {
              ...prev,
              sections: prev.sections.map((s) =>
                s.id === sectionId ? { ...s, ...patch } : s,
              ),
            }
          : prev,
      );

      const existing = pendingPatchesRef.current.get(sectionId);
      if (existing) {
        window.clearTimeout(existing.timer);
        existing.patch = { ...existing.patch, ...patch };
      }
      const timer = window.setTimeout(() => flushSection(sectionId), DEBOUNCE_MS);
      pendingPatchesRef.current.set(sectionId, {
        timer,
        patch: existing ? { ...existing.patch, ...patch } : { ...patch },
      });
    },
    [flushSection],
  );

  const addSection: UseStudentCvResult['addSection'] = useCallback(async (payload) => {
    if (cvId == null) return;
    const added = await cvApi.addSection(cvId, payload);
    setCv((prev) => (prev ? { ...prev, sections: [...prev.sections, added] } : prev));
  }, [cvId]);

  const deleteSection: UseStudentCvResult['deleteSection'] = useCallback(async (sectionId) => {
    await cvApi.deleteSection(sectionId);
    setCv((prev) =>
      prev ? { ...prev, sections: prev.sections.filter((s) => s.id !== sectionId) } : prev,
    );
  }, []);

  const reorderSections: UseStudentCvResult['reorderSections'] = useCallback(async (orderedIds) => {
    if (cvId == null) return;
    // Optimistic reorder.
    setCv((prev) => {
      if (!prev) return prev;
      const byId = new Map(prev.sections.map((s) => [s.id, s]));
      return {
        ...prev,
        sections: orderedIds
          .map((id, idx) => {
            const s = byId.get(id);
            return s ? { ...s, order_index: idx } : null;
          })
          .filter(Boolean) as CvSection[],
      };
    });
    const saved = await cvApi.reorderSections(cvId, orderedIds);
    setCv((prev) => (prev ? { ...prev, sections: saved } : prev));
  }, [cvId]);

  const switchTemplate: UseStudentCvResult['switchTemplate'] = useCallback(async (templateId) => {
    if (cvId == null) return;
    const fresh = await cvApi.switchTemplate(cvId, templateId);
    setCv(fresh);
  }, [cvId]);

  const makePrimary: UseStudentCvResult['makePrimary'] = useCallback(async () => {
    if (cvId == null) return;
    await cvApi.makePrimary(cvId);
    setCv((prev) => (prev ? { ...prev, is_primary: true } : prev));
  }, [cvId]);

  const analyze: UseStudentCvResult['analyze'] = useCallback(async () => {
    if (cvId == null) return;
    const result = await cvApi.analyze(cvId);
    setCv((prev) =>
      prev ? { ...prev, current_score: result.score, last_analyzed_at: result.analyzed_at } : prev,
    );
  }, [cvId]);

  const exportPdf: UseStudentCvResult['exportPdf'] = useCallback(async () => {
    if (cvId == null) return;
    await cvApi.exportPdf(cvId);
    // Phase 1: client-side PDF generation happens at the component level
    // (html2canvas + jsPDF). This call just records last_exported_at.
  }, [cvId]);

  return {
    cv,
    loading,
    error,
    reload,
    updateSection,
    addSection,
    deleteSection,
    reorderSections,
    switchTemplate,
    makePrimary,
    analyze,
    exportPdf,
  };
}
