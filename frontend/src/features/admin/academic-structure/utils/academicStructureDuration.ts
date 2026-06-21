export type DurationUnit = 'weeks' | 'months';

export interface ParsedDuration {
  value: number;
  unit: DurationUnit;
}

const DURATION_PATTERN = /^(\d+)\s*(week|weeks|month|months|semaine|semaines|mois)$/i;

export function parseDurationHint(raw: string | null | undefined): ParsedDuration {
  const text = raw?.trim() ?? '';
  if (!text) return { value: 6, unit: 'months' };

  const match = text.match(DURATION_PATTERN);
  if (!match) {
    const num = Number.parseInt(text, 10);
    if (!Number.isNaN(num) && num > 0) return { value: num, unit: 'months' };
    return { value: 6, unit: 'months' };
  }

  const value = Number.parseInt(match[1], 10);
  const unitToken = match[2].toLowerCase();
  const unit: DurationUnit =
    unitToken.startsWith('week') || unitToken.startsWith('semaine') ? 'weeks' : 'months';

  return { value: Math.max(1, value), unit };
}

export function formatDurationHint(value: number, unit: DurationUnit): string {
  const safeValue = Math.max(1, value);
  if (unit === 'weeks') {
    return safeValue === 1 ? '1 Week' : `${safeValue} Weeks`;
  }
  return safeValue === 1 ? '1 Month' : `${safeValue} Months`;
}

export function formatDurationLabel(value: number, unit: DurationUnit, locale = 'fr'): string {
  const safeValue = Math.max(1, value);
  if (locale.startsWith('fr')) {
    if (unit === 'weeks') return safeValue === 1 ? '1 semaine' : `${safeValue} semaines`;
    return safeValue === 1 ? '1 mois' : `${safeValue} mois`;
  }
  if (unit === 'weeks') return safeValue === 1 ? '1 week' : `${safeValue} weeks`;
  return safeValue === 1 ? '1 month' : `${safeValue} months`;
}
