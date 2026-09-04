/** SHA-256 hex digest of page text for analysis cache keys. */
export async function hashPageContent(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback (non-crypto) — still stable enough for session cache
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return `fallback-${(h >>> 0).toString(16).padStart(8, '0')}-${text.length}`;
}
