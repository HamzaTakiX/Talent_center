export function sanitizeReportText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function splitReportParagraphs(text: string): string[] {
  return sanitizeReportText(text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
