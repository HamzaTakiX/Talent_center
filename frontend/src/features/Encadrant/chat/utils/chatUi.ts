const DEFAULT_RINGS = [
  'bg-[#5ba3ff] text-white',
  'bg-[#a78bfa] text-white',
  'bg-[#f59e0b] text-white',
  'bg-[#22d3ee] text-[#082f49]',
];

export function ringFor(id: string, extra?: Record<string, string>): string {
  if (extra?.[id]) return extra[id];
  const idx = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % DEFAULT_RINGS.length;
  return DEFAULT_RINGS[idx];
}

export function formatNowTime(): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}
