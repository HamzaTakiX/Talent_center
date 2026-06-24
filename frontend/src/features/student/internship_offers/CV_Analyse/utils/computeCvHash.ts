import type { CvBuilderSnapshot } from './cvDraftReader';

function stripVolatile(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripVolatile);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('_')) continue;
      out[key] = stripVolatile(child);
    }
    return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
}

async function sha256Hex(input: ArrayBuffer | string): Promise<string> {
  const data =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeCvHashFromSnapshot(cv: CvBuilderSnapshot): Promise<string> {
  const normalized = stripVolatile(cv);
  const canonical = JSON.stringify(normalized);
  return sha256Hex(canonical);
}

export async function computeCvHashFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return sha256Hex(buffer);
}
