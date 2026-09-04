/**
 * Encadrant layout tokens — aliases to the shared ESCA platform design system.
 * Do not introduce Encadrant-only brand colors here.
 */
import {
  PLATFORM_PAGE_WIDE,
  PLATFORM_PANEL,
  PLATFORM_PANEL_INTERACTIVE,
} from '../../../design-system/platformTokens';

export const ENCADRANT_PAGE_ROOT = PLATFORM_PAGE_WIDE;

export const ENCADRANT_SURFACE_CARD = PLATFORM_PANEL;

export const ENCADRANT_SURFACE_CARD_INTERACTIVE = PLATFORM_PANEL_INTERACTIVE;

/** @deprecated Use `admin-nav-item` / `admin-nav-item-active` directly. */
export const ENCADRANT_NAV_BUTTON_BASE = 'admin-nav-item';
