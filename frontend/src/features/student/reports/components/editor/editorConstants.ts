export const DEFAULT_FONT_FAMILY = 'Inter, sans-serif';
export const DEFAULT_FONT_SIZE = '17px';
export const DEFAULT_TEXT_COLOR = '#1e293b';

export const FONT_SIZE_PRESETS = [
  '10px', '11px', '12px', '14px', '16px', '17px', '18px', '20px', '24px', '32px', '48px',
];

export type FontFamilyGroup = 'sans' | 'serif' | 'mono' | 'display';

export interface FontFamilyPreset {
  label: string;
  value: string;
  group: FontFamilyGroup;
}

/** Polices courantes Microsoft Word + polices web professionnelles. */
export const FONT_FAMILY_PRESETS: FontFamilyPreset[] = [
  { label: 'Inter', value: 'Inter, sans-serif', group: 'sans' },
  { label: 'Arial', value: 'Arial, sans-serif', group: 'sans' },
  { label: 'Arial Black', value: '"Arial Black", sans-serif', group: 'display' },
  { label: 'Calibri', value: 'Calibri, sans-serif', group: 'sans' },
  { label: 'Cambria', value: 'Cambria, Georgia, serif', group: 'serif' },
  { label: 'Candara', value: 'Candara, sans-serif', group: 'sans' },
  { label: 'Century Gothic', value: '"Century Gothic", sans-serif', group: 'sans' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive', group: 'display' },
  { label: 'Consolas', value: 'Consolas, monospace', group: 'mono' },
  { label: 'Constantia', value: 'Constantia, serif', group: 'serif' },
  { label: 'Corbel', value: 'Corbel, sans-serif', group: 'sans' },
  { label: 'Courier New', value: '"Courier New", monospace', group: 'mono' },
  { label: 'Franklin Gothic Medium', value: '"Franklin Gothic Medium", sans-serif', group: 'sans' },
  { label: 'Garamond', value: 'Garamond, serif', group: 'serif' },
  { label: 'Georgia', value: 'Georgia, serif', group: 'serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif', group: 'sans' },
  { label: 'Impact', value: 'Impact, sans-serif', group: 'display' },
  { label: 'Lucida Console', value: '"Lucida Console", monospace', group: 'mono' },
  { label: 'Lucida Sans Unicode', value: '"Lucida Sans Unicode", sans-serif', group: 'sans' },
  { label: 'Palatino Linotype', value: '"Palatino Linotype", Palatino, serif', group: 'serif' },
  { label: 'Segoe UI', value: '"Segoe UI", sans-serif', group: 'sans' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif', group: 'sans' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif', group: 'serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif', group: 'sans' },
  { label: 'Verdana', value: 'Verdana, sans-serif', group: 'sans' },
  { label: 'Book Antiqua', value: '"Book Antiqua", Palatino, serif', group: 'serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif', group: 'sans' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif', group: 'sans' },
  { label: 'Lato', value: 'Lato, sans-serif', group: 'sans' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif', group: 'sans' },
  { label: 'Poppins', value: 'Poppins, sans-serif', group: 'sans' },
  { label: 'Nunito', value: 'Nunito, sans-serif', group: 'sans' },
  { label: 'Raleway', value: 'Raleway, sans-serif', group: 'sans' },
  { label: 'Ubuntu', value: 'Ubuntu, sans-serif', group: 'sans' },
  { label: 'Fira Sans', value: '"Fira Sans", sans-serif', group: 'sans' },
  { label: 'Source Sans Pro', value: '"Source Sans Pro", sans-serif', group: 'sans' },
  { label: 'Merriweather', value: 'Merriweather, Georgia, serif', group: 'serif' },
  { label: 'Playfair Display', value: '"Playfair Display", Georgia, serif', group: 'serif' },
  { label: 'PT Serif', value: '"PT Serif", Georgia, serif', group: 'serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace', group: 'mono' },
  { label: 'Fira Code', value: '"Fira Code", monospace', group: 'mono' },
];

export const FONT_FAMILY_GROUP_LABELS: Record<FontFamilyGroup, string> = {
  sans: 'Sans serif',
  serif: 'Serif',
  mono: 'Monospace',
  display: 'Display',
};

export const TEXT_COLOR_PRESETS = [
  '#0f172a', '#1e293b', '#334155', '#dc2626', '#ea580c', '#ca8a04',
  '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777', '#ffffff',
];

export const HIGHLIGHT_PRESETS = [
  '#fef08a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#fde68a', '#ddd6fe', '#fecaca', '#ffffff',
];
