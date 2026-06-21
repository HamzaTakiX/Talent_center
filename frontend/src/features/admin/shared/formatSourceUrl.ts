const URL_IN_TEXT_REGEX = /https?:\/\/[^\s]+/gi;

export interface SourceUrlDisplay {
  host: string;
  path: string;
}

export type TextWithUrlSegment =
  | { kind: 'text'; text: string }
  | { kind: 'url'; url: string };

export function formatSourceUrlDisplay(raw: string): SourceUrlDisplay {
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, '');
    const path = url.pathname.replace(/\/$/, '') || '/';
    return { host, path };
  } catch {
    const trimmed = raw.trim();
    if (trimmed.length <= 48) return { host: '', path: trimmed };
    return { host: '', path: `${trimmed.slice(0, 45)}…` };
  }
}

export function formatSourceUrlLabel(raw: string): string {
  const { host, path } = formatSourceUrlDisplay(raw);
  if (!host) return path;
  return path === '/' ? host : `${host}${path}`;
}

export function textContainsUrl(text: string): boolean {
  URL_IN_TEXT_REGEX.lastIndex = 0;
  return URL_IN_TEXT_REGEX.test(text);
}

export function splitTextWithUrls(text: string): TextWithUrlSegment[] {
  const segments: TextWithUrlSegment[] = [];
  let lastIndex = 0;
  const regex = new RegExp(URL_IN_TEXT_REGEX.source, 'gi');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', text: text.slice(lastIndex, match.index) });
    }
    segments.push({ kind: 'url', url: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ kind: 'text', text: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ kind: 'text', text });
  }

  return segments;
}
