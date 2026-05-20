import type { DocumentRequestStatus } from '../types';

/**
 * Palette analytics documents — bleu enterprise, tons atténués.
 * Utilisée par les donuts, légendes et badges de statut.
 */
export const DOC_STATUS_CHART_COLOR: Record<DocumentRequestStatus, string> = {
  draft: '#8b95a8',
  submitted: '#6b9bd1',
  incomplete: '#6d8fc4',
  under_verification: '#5b6fd6',
  waiting_reservation: '#7a8bb8',
  reserved: '#5f7ec8',
  validated: '#4a72c4',
  ready: '#4ba3c7',
  delivered: '#5258a0',
  rejected: '#9a7080',
  cancelled: '#6b7a94',
};

export const DOC_REJECTION_CHART_COLOR: Record<string, string> = {
  missing_attachment: '#8a9bc4',
  srf_unpaid: '#9a7080',
  invalid_data: '#6b6fa8',
  other: '#64789b',
};

export function getStatusChartColor(status: DocumentRequestStatus): string {
  return DOC_STATUS_CHART_COLOR[status] ?? '#64789b';
}

export function getRejectionChartColor(cause: string): string {
  return DOC_REJECTION_CHART_COLOR[cause] ?? '#64789b';
}

/** Éclaircit une couleur hex pour les dégradés de donut. */
export function lightenChartColor(hex: string, mixRatio = 0.38): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * mixRatio));
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}
