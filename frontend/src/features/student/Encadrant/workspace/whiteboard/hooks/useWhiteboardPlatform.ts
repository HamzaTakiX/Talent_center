import { useCallback, useEffect, useRef, useState } from 'react';
import { exportToBlob, exportToCanvas, serializeAsJSON } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { jsPDF } from 'jspdf';

import { WHITEBOARD_STORAGE_KEY, whiteboardVersions } from '../data/whiteboardMock';
import { resolveCanvasBackgroundColor } from '../utils/whiteboardColorUtils';

const AUTOSAVE_PREF_KEY = 'esca-whiteboard-autosave-enabled';
const AUTOSAVE_INTERVAL_MS = 30_000;

function readAutoSavePref(): boolean {
  try {
    const v = localStorage.getItem(AUTOSAVE_PREF_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
}

export function useWhiteboardPlatform(backgroundColor: string, backgroundOpacity: number) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const canvasColorRef = useRef(
    resolveCanvasBackgroundColor(backgroundColor, backgroundOpacity),
  );

  useEffect(() => {
    canvasColorRef.current = resolveCanvasBackgroundColor(backgroundColor, backgroundOpacity);
  }, [backgroundColor, backgroundOpacity]);
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(readAutoSavePref);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeVersionId, setActiveVersionId] = useState(whiteboardVersions[0]?.id ?? 'v4');

  const setApi = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  const saveBoard = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    try {
      const elements = api.getSceneElements();
      if (elements.length === 0) return;
      const appState = {
        ...api.getAppState(),
        viewBackgroundColor: canvasColorRef.current,
      };
      const files = api.getFiles();
      const payload = serializeAsJSON(elements, appState, files, 'local');
      localStorage.setItem(WHITEBOARD_STORAGE_KEY, payload);
      const label = new Date().toLocaleTimeString();
      setSavedLabel((prev) => (prev === label ? prev : label));
    } catch {
      setSavedLabel(null);
    }
  }, []);

  const exportPng = useCallback(async () => {
    const api = apiRef.current;
    if (!api || isExporting) return;
    setIsExporting(true);
    try {
      const elements = api.getSceneElements();
      const appState = api.getAppState();
      const files = api.getFiles();
      const blob = await exportToBlob({
        elements,
        appState: { ...appState, exportBackground: true },
        files,
        mimeType: 'image/png',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'esca-whiteboard.png';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting]);

  const exportPdf = useCallback(async () => {
    const api = apiRef.current;
    if (!api || isExporting) return;
    setIsExporting(true);
    try {
      const elements = api.getSceneElements();
      const appState = api.getAppState();
      const files = api.getFiles();
      const canvas = await exportToCanvas({
        elements,
        appState: { ...appState, exportBackground: true },
        files,
      });
      const img = canvas.toDataURL('image/png');
      const w = canvas.width;
      const h = canvas.height;
      const pdf = new jsPDF({
        orientation: w > h ? 'landscape' : 'portrait',
        unit: 'px',
        format: [w, h],
      });
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save('esca-whiteboard.pdf');
    } finally {
      setIsExporting(false);
    }
  }, [isExporting]);

  const restoreVersion = useCallback((versionId: string) => {
    setActiveVersionId(versionId);
    setVersionPanelOpen(false);
  }, []);

  const toggleShare = useCallback(() => setShareOpen((v) => !v), []);

  const setAutoSave = useCallback((enabled: boolean) => {
    setAutoSaveEnabled(enabled);
    try {
      localStorage.setItem(AUTOSAVE_PREF_KEY, String(enabled));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!autoSaveEnabled) return;
    const tick = () => {
      if (apiRef.current) saveBoard();
    };
    const id = window.setInterval(tick, AUTOSAVE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoSaveEnabled, saveBoard]);

  return {
    setApi,
    versionPanelOpen,
    setVersionPanelOpen,
    shareOpen,
    setShareOpen,
    toggleShare,
    savedLabel,
    autoSaveEnabled,
    setAutoSave,
    saveBoard,
    exportPng,
    exportPdf,
    isExporting,
    activeVersionId,
    restoreVersion,
    versions: whiteboardVersions,
  };
}
