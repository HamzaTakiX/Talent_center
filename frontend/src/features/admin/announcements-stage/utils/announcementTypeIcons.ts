import {
  AlertTriangle,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarClock,
  FileText,
  GraduationCap,
  Hammer,
  Laptop,
  Layers,
  MapPin,
  Megaphone,
  MessageSquare,
  Pin,
  Presentation,
  Radio,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Video,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const ANNOUNCEMENT_TYPE_ICON_OPTIONS = [
  'megaphone',
  'briefcase',
  'graduation-cap',
  'calendar-clock',
  'trophy',
  'users',
  'building-2',
  'alert-triangle',
  'sparkles',
  'radio',
  'presentation',
  'video',
  'book-open',
  'hammer',
  'pin',
  'message-square',
  'laptop',
  'map-pin',
  'star',
  'zap',
  'target',
  'layers',
  'bell',
  'file-text',
] as const;

export type AnnouncementTypeIconKey = (typeof ANNOUNCEMENT_TYPE_ICON_OPTIONS)[number];

const ICON_MAP: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  'calendar-clock': CalendarClock,
  trophy: Trophy,
  users: Users,
  'building-2': Building2,
  'alert-triangle': AlertTriangle,
  sparkles: Sparkles,
  radio: Radio,
  presentation: Presentation,
  video: Video,
  'book-open': BookOpen,
  hammer: Hammer,
  pin: Pin,
  'message-square': MessageSquare,
  laptop: Laptop,
  'map-pin': MapPin,
  star: Star,
  zap: Zap,
  target: Target,
  layers: Layers,
  bell: Bell,
  'file-text': FileText,
};

export const ANNOUNCEMENT_TYPE_COLOR_OPTIONS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0891b2',
  '#64748b',
  '#0f172a',
] as const;

export function resolveAnnouncementTypeIcon(key?: string | null): LucideIcon {
  if (!key) return Megaphone;
  return ICON_MAP[key] ?? Megaphone;
}

export function resolveTypeIconFromItem(type?: {
  icon?: string | null;
  code?: string;
}): LucideIcon {
  if (type?.icon) return resolveAnnouncementTypeIcon(type.icon);
  if (!type?.code) return Megaphone;
  if (type.code.includes('internship') || type.code.includes('pfe')) return Briefcase;
  if (type.code.includes('emergency') || type.code.includes('deadline')) return AlertTriangle;
  return Megaphone;
}
