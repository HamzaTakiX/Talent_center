import type { WhiteboardBackgroundPresetId, WhiteboardPreferences } from '../types/whiteboardPreferences';

export const WHITEBOARD_PREFS_STORAGE_PREFIX = 'esca-whiteboard-prefs';

export const DEFAULT_WHITEBOARD_BACKGROUND = '#ffffff';

export const BACKGROUND_PRESETS: ReadonlyArray<{
  id: WhiteboardBackgroundPresetId;
  hex: string;
}> = [
  { id: 'white', hex: '#ffffff' },
  { id: 'lightGray', hex: '#f1f5f9' },
  { id: 'darkGray', hex: '#374151' },
  { id: 'navy', hex: '#0f172a' },
  { id: 'black', hex: '#000000' },
  { id: 'beige', hex: '#f5f0e6' },
  { id: 'green', hex: '#14532d' },
  { id: 'blue', hex: '#1e3a8a' },
  { id: 'purple', hex: '#581c87' },
] as const;

export const DEFAULT_WHITEBOARD_PREFERENCES: WhiteboardPreferences = {
  theme: 'light',
  backgroundColor: DEFAULT_WHITEBOARD_BACKGROUND,
  backgroundOpacity: 100,
  backgroundType: 'dotted-grid',
  language: 'fr',
};
