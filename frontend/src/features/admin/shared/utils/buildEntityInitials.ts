export function buildEntityInitials(name: string, email?: string): string {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  const local = (email ?? '').split('@')[0] ?? '';
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return '??';
}
