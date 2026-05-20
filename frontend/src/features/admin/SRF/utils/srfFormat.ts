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
