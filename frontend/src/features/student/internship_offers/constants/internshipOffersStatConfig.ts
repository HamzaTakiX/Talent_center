import { CheckCircle2, Clock, Send, XCircle } from 'lucide-react';
import type {
  InternshipOffersStatColorMap,
  InternshipOffersStatIconMap,
} from '../types';

export const internshipOffersStatIconMap: InternshipOffersStatIconMap = {
  applications: Send,
  pending: Clock,
  accepted: CheckCircle2,
  rejected: XCircle,
};

/** Couleurs d’accent (style admin encadrants / students glass cards). */
export const internshipOffersStatAccentMap: Record<
  keyof InternshipOffersStatIconMap,
  { accent: string; accentBg: string }
> = {
  applications: { accent: '#3b82f6', accentBg: 'rgba(59, 130, 246, 0.16)' },
  pending: { accent: '#eab308', accentBg: 'rgba(234, 179, 8, 0.16)' },
  accepted: { accent: '#22c55e', accentBg: 'rgba(34, 197, 94, 0.16)' },
  rejected: { accent: '#fb2c36', accentBg: 'rgba(251, 44, 54, 0.16)' },
};

/** @deprecated Prefer internshipOffersStatAccentMap — kept for older iconBgClass consumers. */
export const internshipOffersStatColorMap: InternshipOffersStatColorMap = {
  applications: 'bg-[#2b7fff]',
  pending: 'bg-[#eab308]',
  accepted: 'bg-[#22c55e]',
  rejected: 'bg-[#fb2c36]',
};
