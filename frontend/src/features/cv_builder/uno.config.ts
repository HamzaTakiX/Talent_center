import {
  defineConfig,
  presetWind3,
  presetIcons,
  transformerDirectives,
} from 'unocss';
import hazeuiPreset from '@haze-ui/preset';

/** UnoCSS scoped to QuickCV only — does not scan admin/student React code. */
export default defineConfig({
  scope: '.quickcv-root',

  content: {
    pipeline: {
      include: [
        'src/features/cv_builder/**/*.svelte',
        'src/features/cv/quickcv/**/*.svelte',
      ],
      exclude: [
        'src/features/admin/**',
        'src/features/student/**',
        'node_modules/**',
      ],
    },
  },

  presets: [presetIcons({ scale: 1.2 }), presetWind3(), hazeuiPreset({})],

  transformers: [transformerDirectives()],

  theme: {
    colors: {
      fg: 'var(--admin-text, var(--fg))',
      bg: 'var(--admin-bg-elevated, var(--bg))',
      primary: { DEFAULT: 'var(--admin-brand, var(--primary))', fg: '#ffffff' },
      secondary: {
        DEFAULT: 'var(--admin-surface-inset, var(--secondary))',
        fg: 'var(--admin-text-secondary, var(--secondary-fg))',
      },
      border: 'var(--admin-border, var(--border))',
      input: 'var(--admin-input-bg, var(--input))',
      ring: 'var(--admin-brand-muted, var(--ring))',
      muted: {
        DEFAULT: 'var(--admin-surface-inset, var(--muted))',
        fg: 'var(--admin-text-muted, var(--muted-fg))',
      },
      success: {
        DEFAULT: 'var(--success)',
        subtle: 'var(--success-subtle)',
      },
      warning: {
        DEFAULT: 'var(--warning)',
        subtle: 'var(--warning-subtle)',
      },
      danger: {
        DEFAULT: 'var(--danger)',
        subtle: 'var(--danger-subtle)',
      },
      info: {
        DEFAULT: 'var(--info)',
        subtle: 'var(--info-subtle)',
      },
    },
  },

  shortcuts: {
    frow: 'flex items-center gap-3',
  },
});
