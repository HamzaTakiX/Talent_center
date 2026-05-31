import { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import { Excalidraw, restore } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type { ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';

import { WHITEBOARD_STORAGE_KEY } from '../data/whiteboardMock';
import type { WhiteboardBackgroundType } from '../types/whiteboardPreferences';
import { resolveCanvasBackgroundColor } from '../utils/whiteboardColorUtils';
import {
  applyExcalidrawViewBackground,
  mergeSceneBackgroundColor,
  usesPatternBackgroundLayer,
} from '../utils/whiteboardCanvasBackground';

interface ExcalidrawEditorProps {
  onApiReady: (api: ExcalidrawImperativeAPI) => void;
  theme: 'light' | 'dark';
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundType: WhiteboardBackgroundType;
}

function loadInitialScene(
  backgroundColor: string,
  backgroundOpacity: number,
  backgroundType: WhiteboardBackgroundType,
): ExcalidrawInitialDataState | null {
  try {
    const raw = localStorage.getItem(WHITEBOARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Parameters<typeof restore>[0];
    const restored = restore(parsed, null, null) as ExcalidrawInitialDataState;
    return mergeSceneBackgroundColor(restored, backgroundColor, backgroundOpacity, backgroundType);
  } catch {
    return null;
  }
}

/** Loaded once per page session — avoids Excalidraw reset on parent re-renders. */
const initialSceneRef: {
  current: ExcalidrawInitialDataState | null | undefined;
  color: string | undefined;
  type: WhiteboardBackgroundType | undefined;
} = {
  current: undefined,
  color: undefined,
  type: undefined,
};

function getInitialSceneOnce(
  backgroundColor: string,
  backgroundOpacity: number,
  backgroundType: WhiteboardBackgroundType,
): ExcalidrawInitialDataState | null {
  if (
    initialSceneRef.current === undefined ||
    initialSceneRef.color !== backgroundColor ||
    initialSceneRef.type !== backgroundType
  ) {
    initialSceneRef.current = loadInitialScene(backgroundColor, backgroundOpacity, backgroundType);
    initialSceneRef.color = backgroundColor;
    initialSceneRef.type = backgroundType;
  }
  return initialSceneRef.current;
}

export function resetWhiteboardInitialSceneCache(): void {
  initialSceneRef.current = undefined;
  initialSceneRef.color = undefined;
  initialSceneRef.type = undefined;
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
  theme,
  backgroundColor,
  backgroundOpacity,
  backgroundType,
}) => {
  const apiBoundRef = useRef(false);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const initialDataRef = useRef<ExcalidrawInitialDataState | null | undefined>(undefined);

  if (initialDataRef.current === undefined) {
    initialDataRef.current = getInitialSceneOnce(
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
      applyBackground(api);
      if (apiBoundRef.current) return;
      apiBoundRef.current = true;
      onApiReady(api);
    },
    [applyBackground, onApiReady],
  );

  useEffect(() => {
    applyBackground(apiRef.current);
  }, [applyBackground]);

  useEffect(
    () => () => {
      apiBoundRef.current = false;
      apiRef.current = null;
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
      />
    </div>
  );
};

export default ExcalidrawEditor;
