import { CaptureUpdateAction } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';

import type { AdminTheme } from '../../../../../admin/dashboard/context/AdminThemeContext';
import { DEFAULT_WHITEBOARD_BACKGROUND } from '../constants/whiteboardBackground';
import type { WhiteboardBackgroundType } from '../types/whiteboardPreferences';
import { resolveCanvasBackgroundColor } from './whiteboardColorUtils';

/** Default canvas fill when the user has not customized the background yet. */
export function getThemeDefaultBackgroundColor(theme: AdminTheme): string {
  return theme === 'dark' ? '#0f172a' : DEFAULT_WHITEBOARD_BACKGROUND;
}

/** Fills previously handed out as theme defaults, including superseded ones. */
const THEME_DEFAULT_BACKGROUNDS = ['#ffffff', '#f1f5f9', '#0f172a', '#1e293b'];

/**
 * A canvas still sitting on a theme default follows the app theme; only a colour
 * the student picked on purpose survives a light/dark switch.
 */
export function isThemeDefaultBackgroundColor(color: string): boolean {
  return THEME_DEFAULT_BACKGROUNDS.includes(color.trim().toLowerCase());
}

/** Pattern/grid styles render on the CSS layer behind a transparent Excalidraw canvas. */
export function usesPatternBackgroundLayer(type: WhiteboardBackgroundType): boolean {
  return type !== 'solid' && type !== 'blank';
}

export function resolveExcalidrawViewBackgroundColor(
  backgroundColor: string,
  backgroundOpacity: number,
  backgroundType: WhiteboardBackgroundType,
): string {
  if (usesPatternBackgroundLayer(backgroundType)) return 'transparent';
  return resolveCanvasBackgroundColor(backgroundColor, backgroundOpacity);
}

export function mergeSceneBackgroundColor(
  scene: ExcalidrawInitialDataState | null,
  backgroundColor: string,
  backgroundOpacity: number,
  backgroundType: WhiteboardBackgroundType,
): ExcalidrawInitialDataState | null {
  if (!scene) return null;
  return {
    ...scene,
    appState: {
      ...scene.appState,
      viewBackgroundColor: resolveExcalidrawViewBackgroundColor(
        backgroundColor,
        backgroundOpacity,
        backgroundType,
      ),
      gridModeEnabled: false,
    },
  };
}

export function applyExcalidrawViewBackground(
  api: ExcalidrawImperativeAPI | null | undefined,
  backgroundColor: string,
  backgroundOpacity: number,
  backgroundType: WhiteboardBackgroundType,
): void {
  if (!api) return;

  api.updateScene({
    appState: {
      viewBackgroundColor: resolveExcalidrawViewBackgroundColor(
        backgroundColor,
        backgroundOpacity,
        backgroundType,
      ),
      gridModeEnabled: false,
    },
    captureUpdate: CaptureUpdateAction.NEVER,
  });
}
