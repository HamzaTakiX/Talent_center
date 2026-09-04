import { FunctionComponent } from 'react';

import ExcalidrawEditor from './ExcalidrawEditor';
import type { BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { WhiteboardBackgroundType } from '../types/whiteboardPreferences';

/** Isolates Excalidraw from top-bar autosave label updates; still receives canvas prefs. */
interface WhiteboardCanvasShellProps {
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

const WhiteboardCanvasShell: FunctionComponent<WhiteboardCanvasShellProps> = ({
  onApiReady,
  onSceneChange,
  storageKey,
  theme,
  backgroundColor,
  backgroundOpacity,
  backgroundType,
}) => (
  <ExcalidrawEditor
    onApiReady={onApiReady}
    onSceneChange={onSceneChange}
    storageKey={storageKey}
    theme={theme}
    backgroundColor={backgroundColor}
    backgroundOpacity={backgroundOpacity}
    backgroundType={backgroundType}
  />
);

/** Re-render when canvas appearance prefs change (background type / color). */
export default WhiteboardCanvasShell;
