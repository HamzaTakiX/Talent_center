import { type CSSProperties, FunctionComponent } from 'react';
import { Briefcase } from 'lucide-react';

/* ─────────────────────────────────────────────────
   Palette  — rich gradient pairs (from → to)
   Order matters: pick from these 10 based on hash.
───────────────────────────────────────────────── */
const PALETTE: [string, string][] = [
  ['#4f46e5', '#7c3aed'],   // indigo → violet
  ['#0891b2', '#06b6d4'],   // cyan
  ['#059669', '#10b981'],   // emerald
  ['#e11d48', '#be123c'],   // rose
  ['#d97706', '#f59e0b'],   // amber
  ['#7c3aed', '#a855f7'],   // violet → purple
  ['#0ea5e9', '#38bdf8'],   // sky
  ['#0d9488', '#14b8a6'],   // teal
  ['#16a34a', '#22c55e'],   // green
  ['#9333ea', '#c026d3'],   // purple → fuchsia
];

/** Deterministic index from a string (same name → same color forever). */
function nameHash(name: string): number {
  let h = 5381;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) >>> 0;
  }
  return h % PALETTE.length;
}

/** 1–2 uppercase chars from company name. */
function getInitial(name?: string): string {
  const clean = (name ?? '').trim();
  if (!clean) return '?';
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

/* ─────────────────────────────────────────────────
   Size configs
───────────────────────────────────────────────── */
export type AvatarSize = 'kpi' | 'table' | 'card' | 'detail' | 'import';

const SIZE_CONFIG: Record<
  AvatarSize,
  { initial: string; icon: string; iconWrap: string }
> = {
  kpi:    { initial: 'offer-avatar__initial--kpi',    icon: 'offer-avatar__icon--kpi',    iconWrap: 'offer-avatar__icon-wrap--kpi' },
  table:  { initial: 'offer-avatar__initial--table',  icon: 'offer-avatar__icon--table',  iconWrap: 'offer-avatar__icon-wrap--table' },
  card:   { initial: 'offer-avatar__initial--card',   icon: 'offer-avatar__icon--card',   iconWrap: 'offer-avatar__icon-wrap--card' },
  detail: { initial: 'offer-avatar__initial--detail', icon: 'offer-avatar__icon--detail', iconWrap: 'offer-avatar__icon-wrap--detail' },
  import: { initial: 'offer-avatar__initial--import', icon: 'offer-avatar__icon--import', iconWrap: 'offer-avatar__icon-wrap--import' },
};

/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
interface OfferAvatarFallbackProps {
  companyName?: string;
  size?: AvatarSize;
  className?: string;
}

const OfferAvatarFallback: FunctionComponent<OfferAvatarFallbackProps> = ({
  companyName,
  size = 'table',
  className = '',
}) => {
  const idx = nameHash(companyName ?? '');
  const [from, to] = PALETTE[idx];
  const cfg = SIZE_CONFIG[size];
  const initial = getInitial(companyName);

  const cssVars: CSSProperties = {
    '--oa-from': from,
    '--oa-to': to,
  } as CSSProperties;

  return (
    <div
      className={`offer-avatar ${className}`}
      style={cssVars}
      aria-hidden
    >
      {/* Animated shimmer sweep */}
      <span className="offer-avatar__shimmer" aria-hidden />

      {/* Company initial */}
      <span className={`offer-avatar__initial ${cfg.initial}`}>
        {initial}
      </span>

      {/* Briefcase badge — bottom-right corner */}
      <span className={`offer-avatar__icon-wrap ${cfg.iconWrap}`}>
        <Briefcase className={`offer-avatar__icon ${cfg.icon}`} strokeWidth={2} aria-hidden />
      </span>
    </div>
  );
};

export default OfferAvatarFallback;
