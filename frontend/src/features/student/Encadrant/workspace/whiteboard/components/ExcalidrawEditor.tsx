import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { CaptureUpdateAction, Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type {
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types';

import type { WhiteboardBackgroundType } from '../types/whiteboardPreferences';
import { resolveCanvasBackgroundColor } from '../utils/whiteboardColorUtils';
import {
  applyExcalidrawViewBackground,
  mergeSceneBackgroundColor,
  usesPatternBackgroundLayer,
} from '../utils/whiteboardCanvasBackground';
import {
  countLiveWhiteboardElements,
  readWhiteboardScene,
} from '../utils/whiteboardSceneStorage';

interface ExcalidrawEditorProps {
  onApiReady: (api: ExcalidrawImperativeAPI) => void;
  onSceneChange: (
    elements: readonly { isDeleted?: boolean }[],
    appState: Record<string, unknown>,
    files: BinaryFiles,
  ) => void;
  storageKey: string;
  theme: 'light' | 'dark';
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundType: WhiteboardBackgroundType;
}

function loadInitialScene(
  storageKey: string,
  backgroundColor: string,
  backgroundOpacity: number,
  backgroundType: WhiteboardBackgroundType,
): ExcalidrawInitialDataState | null {
  const stored = readWhiteboardScene(storageKey);
  if (!stored) return null;
  return {
    ...mergeSceneBackgroundColor(stored, backgroundColor, backgroundOpacity, backgroundType),
    scrollToContent: true,
  };
}

/** Loaded once per page session — avoids Excalidraw reset on parent re-renders. */
const initialSceneRef: {
  current: ExcalidrawInitialDataState | null | undefined;
  storageKey: string | undefined;
  color: string | undefined;
  type: WhiteboardBackgroundType | undefined;
} = {
  current: undefined,
  storageKey: undefined,
  color: undefined,
  type: undefined,
};

function getInitialSceneOnce(
  storageKey: string,
  backgroundColor: string,
  backgroundOpacity: number,
  backgroundType: WhiteboardBackgroundType,
): ExcalidrawInitialDataState | null {
  if (
    initialSceneRef.current === undefined ||
    initialSceneRef.storageKey !== storageKey ||
    initialSceneRef.color !== backgroundColor ||
    initialSceneRef.type !== backgroundType
  ) {
    initialSceneRef.current = loadInitialScene(
      storageKey,
      backgroundColor,
      backgroundOpacity,
      backgroundType,
    );
    initialSceneRef.storageKey = storageKey;
    initialSceneRef.color = backgroundColor;
    initialSceneRef.type = backgroundType;
  }
  return initialSceneRef.current;
}

export function resetWhiteboardInitialSceneCache(): void {
  initialSceneRef.current = undefined;
  initialSceneRef.storageKey = undefined;
  initialSceneRef.color = undefined;
  initialSceneRef.type = undefined;
}

function restoreStoredScene(
  api: ExcalidrawImperativeAPI,
  storageKey: string,
  backgroundColor: string,
  backgroundOpacity: number,
  backgroundType: WhiteboardBackgroundType,
): void {
  const stored = loadInitialScene(storageKey, backgroundColor, backgroundOpacity, backgroundType);
  const storedCount = countLiveWhiteboardElements(stored?.elements);
  if (!stored || storedCount === 0) return;

  const liveCount = countLiveWhiteboardElements(api.getSceneElements());
  if (liveCount > 0) return;

  api.updateScene({
    elements: stored.elements ?? [],
    appState: stored.appState,
    captureUpdate: CaptureUpdateAction.NEVER,
  });
  if (stored.files) {
    api.addFiles(Object.values(stored.files));
  }
}

const uiOptions = {
  canvasActions: {
    export: false as const,
    loadScene: false as const,
    /** Background is managed in Talent Center workspace settings. */
    changeViewBackgroundColor: false,
  },
};

const ExcalidrawEditor: FunctionComponent<ExcalidrawEditorProps> = ({
  onApiReady,
  onSceneChange,
  storageKey,
  theme,
  backgroundColor,
  backgroundOpacity,
  backgroundType,
}) => {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const recoveredRef = useRef(false);
  const [apiReady, setApiReady] = useState(false);
  const initialDataRef = useRef<ExcalidrawInitialDataState | null | undefined>(undefined);

  if (initialDataRef.current === undefined) {
    initialDataRef.current = getInitialSceneOnce(
      storageKey,
      backgroundColor,
      backgroundOpacity,
      backgroundType,
    );
  }

  const applyBackground = useCallback(
    (api: ExcalidrawImperativeAPI | null) => {
      applyExcalidrawViewBackground(api, backgroundColor, backgroundOpacity, backgroundType);
    },
    [backgroundColor, backgroundOpacity, backgroundType],
  );

  const handleApi = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      apiRef.current = api;
      onApiReady(api);
      setApiReady(true);
    },
    [onApiReady],
  );

  /**
   * Excalidraw can apply an empty scene after handing over the API.
   * Restore from storage if the live canvas has no drawings.
   */
  useEffect(() => {
    if (!apiReady || recoveredRef.current) return;
    const api = apiRef.current;
    if (!api) return;

    const frame = requestAnimationFrame(() => {
      restoreStoredScene(api, storageKey, backgroundColor, backgroundOpacity, backgroundType);
      applyBackground(api);
      recoveredRef.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [apiReady, applyBackground, backgroundColor, backgroundOpacity, backgroundType, storageKey]);

  useEffect(() => {
    applyBackground(apiRef.current);
  }, [applyBackground, apiReady]);

  useEffect(
    () => () => {
      apiRef.current = null;
      recoveredRef.current = false;
    },
    [],
  );

  const patterned = usesPatternBackgroundLayer(backgroundType);

  return (
    <div
      className={`student-whiteboard-excalidraw h-full w-full ${
        patterned ? 'student-whiteboard-excalidraw--patterned' : ''
      }`}
      style={
        {
          '--wb-canvas-color': resolveCanvasBackgroundColor(backgroundColor, backgroundOpacity),
        } as React.CSSProperties
      }
      data-bg-type={backgroundType}
    >
      <Excalidraw
        excalidrawAPI={handleApi}
        initialData={initialDataRef.current ?? undefined}
        theme={theme}
        name="ESCA PFE Workspace"
        isCollaborating={false}
        UIOptions={uiOptions}
        onChange={(elements, appState, files) => {
          onSceneChange(elements, appState, files);
        }}
      />
    </div>
  );
};

export default ExcalidrawEditor;
