/** Short program label for compact UI (e.g. "LME" instead of "LME (Licence …)"). */
export function formatProgramShort(program: string, filiereCode?: string): string {
  const code = (filiereCode ?? '').trim();
  if (code) return code;

  const name = (program ?? '').trim();
  if (!name) return '—';

  const parenIdx = name.indexOf('(');
  if (parenIdx > 0) return name.slice(0, parenIdx).trim();

  const dashMatch = name.match(/\s[—-]\s/);
  if (dashMatch?.index != null && dashMatch.index > 0) {
    return name.slice(0, dashMatch.index).trim();
  }

  return name;
}

export function formatMad(amount: string | number, currency = 'MAD'): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!Number.isFinite(n)) return `${amount} ${currency}`;
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
}

export function financialStatusVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'CLEAR') return 'success';
  if (status === 'PARTIAL' || status === 'PENDING_VALIDATION') return 'warning';
  if (status === 'OVERDUE' || status === 'BLOCKED' || status === 'AT_RISK') return 'danger';
  return 'neutral';
}

export function proofStatusVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'danger';
  if (status === 'REQUIRES_CORRECTION' || status === 'UNDER_REVIEW') return 'warning';
  if (status === 'PENDING' || status === 'SUBMITTED') return 'info';
  return 'neutral';
}
