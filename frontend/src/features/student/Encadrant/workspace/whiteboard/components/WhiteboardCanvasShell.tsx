import { FunctionComponent } from 'react';

import ExcalidrawEditor from './ExcalidrawEditor';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { WhiteboardBackgroundType } from '../types/whiteboardPreferences';

/** Isolates Excalidraw from top-bar autosave label updates; still receives canvas prefs. */
interface WhiteboardCanvasShellProps {
  onApiReady: (api: ExcalidrawImperativeAPI) => void;
  theme: 'light' | 'dark';
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundType: WhiteboardBackgroundType;
}

const WhiteboardCanvasShell: FunctionComponent<WhiteboardCanvasShellProps> = ({
  onApiReady,
  theme,
  backgroundColor,
  backgroundOpacity,
  backgroundType,
}) => (
  <ExcalidrawEditor
    onApiReady={onApiReady}
    theme={theme}
    backgroundColor={backgroundColor}
    backgroundOpacity={backgroundOpacity}
    backgroundType={backgroundType}
  />
);

/** Re-render when canvas appearance prefs change (background type / color). */
export default WhiteboardCanvasShell;
