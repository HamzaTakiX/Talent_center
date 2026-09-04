import { useCallback, useEffect, useRef, useState } from 'react';
import { exportToBlob, exportToCanvas } from '@excalidraw/excalidraw';
import type { BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { jsPDF } from 'jspdf';

import { whiteboardVersions } from '../data/whiteboardMock';
import { resolveCanvasBackgroundColor } from '../utils/whiteboardColorUtils';
import {
  findWorkspaceBoard,
  upsertWorkspaceBoard,
  type WorkspaceBoardStatus,
} from '../utils/whiteboardBoardRegistry';
import {
  countLiveWhiteboardElements,
  writeWhiteboardScene,
} from '../utils/whiteboardSceneStorage';

const AUTOSAVE_PREF_KEY = 'esca-whiteboard-autosave-enabled';
const AUTOSAVE_DEBOUNCE_MS = 400;

type SceneSnapshot = {
  elements: Parameters<typeof writeWhiteboardScene>[1];
  appState: Parameters<typeof writeWhiteboardScene>[2];
  files: BinaryFiles;
};

function readAutoSavePref(): boolean {
  try {
    const v = localStorage.getItem(AUTOSAVE_PREF_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
}

function snapshotFromApi(
  api: ExcalidrawImperativeAPI,
  canvasColor: string,
): SceneSnapshot {
  return {
    elements: api.getSceneElements(),
    appState: {
      ...api.getAppState(),
      viewBackgroundColor: canvasColor,
    },
    files: api.getFiles(),
  };
}

export function useWhiteboardPlatform(
  storageKey: string,
  backgroundColor: string,
  backgroundOpacity: number,
  boardId?: string,
) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const sceneRef = useRef<SceneSnapshot | null>(null);
  const debounceRef = useRef<number | null>(null);
  const skipPersistRef = useRef(false);
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
    sceneRef.current = snapshotFromApi(api, canvasColorRef.current);
  }, []);

  const persistSnapshot = useCallback(
    (snapshot: SceneSnapshot | null, status?: WorkspaceBoardStatus): boolean => {
      if (skipPersistRef.current) return false;
      if (!snapshot || countLiveWhiteboardElements(snapshot.elements) === 0) return false;
      const wrote = writeWhiteboardScene(
        storageKey,
        snapshot.elements,
        {
          ...snapshot.appState,
          viewBackgroundColor: canvasColorRef.current,
        },
        snapshot.files,
      );
      if (!wrote) return false;
      if (boardId) {
        const current = findWorkspaceBoard(boardId);
        upsertWorkspaceBoard(boardId, status ?? current?.status ?? 'draft');
      }
      const label = new Date().toLocaleTimeString();
      setSavedLabel((prev) => (prev === label ? prev : label));
      return true;
    },
    [boardId, storageKey],
  );

  const abandonUnsavedEdits = useCallback(() => {
    skipPersistRef.current = true;
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const saveBoard = useCallback((status?: WorkspaceBoardStatus): boolean => {
    if (skipPersistRef.current) return false;
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const api = apiRef.current;
    const snapshot = api ? snapshotFromApi(api, canvasColorRef.current) : sceneRef.current;
    if (snapshot) sceneRef.current = snapshot;
    return persistSnapshot(snapshot, status);
  }, [persistSnapshot]);

  const onSceneChange = useCallback(
    (
      elements: SceneSnapshot['elements'],
      appState: SceneSnapshot['appState'],
      files: BinaryFiles,
    ) => {
      sceneRef.current = { elements, appState, files };
      if (!autoSaveEnabled) return;
      if (debounceRef.current != null) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        debounceRef.current = null;
        persistSnapshot(sceneRef.current);
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [autoSaveEnabled, persistSnapshot],
  );

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
    const flush = () => {
      if (document.visibilityState === 'hidden') saveBoard();
    };
    const onHide = () => saveBoard();
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', onHide);
    window.addEventListener('beforeunload', onHide);
    return () => {
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('beforeunload', onHide);
      saveBoard();
    };
  }, [saveBoard]);

  return {
    setApi,
    onSceneChange,
    versionPanelOpen,
    setVersionPanelOpen,
    shareOpen,
    setShareOpen,
    toggleShare,
    savedLabel,
    autoSaveEnabled,
    setAutoSave,
    saveBoard,
    abandonUnsavedEdits,
    exportPng,
    exportPdf,
    isExporting,
    activeVersionId,
    restoreVersion,
    versions: whiteboardVersions,
  };
}
