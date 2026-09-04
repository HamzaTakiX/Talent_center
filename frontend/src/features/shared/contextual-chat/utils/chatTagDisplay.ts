/** Fallback colors when a message only carries tag codes. */
export const CHAT_TAG_FALLBACK_COLORS: Record<string, string> = {
  report: '#5ba3ff',
  task: '#a78bfa',
  meeting: '#22d3ee',
  correction: '#f59e0b',
  validation: '#22c55e',
  feedback: '#94a3b8',
  urgency: '#ef4444',
  blockage: '#dc2626',
  internship_followup: '#8b5cf6',
  internal_note: '#64748b',
  escalation: '#b91c1c',
  financial_warning: '#ea580c',
};

export function chatTagColor(code: string, preferred?: string): string {
  if (preferred) return preferred;
  return CHAT_TAG_FALLBACK_COLORS[code] ?? '#64748b';
}
