import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  ClipboardList,
  FileText,
  Globe,
  Link2,
  MapPin,
  PenLine,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { WizardStep } from '../types/createOfferWorkflow';

export interface WizardStepDef {
  key: WizardStep;
  icon: LucideIcon;
}

export const WIZARD_STEPS: WizardStepDef[] = [
  { key: 'basic', icon: Building2 },
  { key: 'description', icon: FileText },
  { key: 'skills', icon: Sparkles },
  { key: 'targeting', icon: Target },
  { key: 'recruitment', icon: Calendar },
  { key: 'review', icon: CheckCircle },
];

export const INTERNSHIP_TYPE_OPTIONS = [
  { value: 'internship', labelKey: 'internship' },
  { value: 'pfe', labelKey: 'pfe' },
  { value: 'pfa', labelKey: 'pfa' },
  { value: 'alternance', labelKey: 'alternance' },
  { value: 'summer', labelKey: 'summer' },
  { value: 'observation', labelKey: 'observation' },
] as const;

export const WORK_MODE_OPTIONS = [
  { value: 'remote', labelKey: 'remote', icon: Globe },
  { value: 'hybrid', labelKey: 'hybrid', icon: Briefcase },
  { value: 'onsite', labelKey: 'onsite', icon: MapPin },
] as const;

export const TARGETING_PROGRAMS: string[] = [];
export const TARGETING_CLASSES: string[] = [];
export const TARGETING_LEVELS: string[] = [];
export const TARGETING_DEPARTMENTS: string[] = [];
export const TARGETING_CATEGORIES: string[] = [];

export const IMPORT_LOADING_MESSAGES = [
  'analyzingPage',
  'detectingCompany',
  'extractingTitle',
  'extractingRequirements',
  'buildingDraft',
  'normalizingContent',
  'generatingPreview',
] as const;

export const IMPORT_PLATFORM_LABELS: Record<string, string> = {
  LINKEDIN: 'LinkedIn',
  INDEED: 'Indeed',
  REKRUTE: 'ReKrute',
  EMPLOI_MA: 'Emploi.ma',
  NOVOJOB: 'Novojob',
  COMPANY_WEBSITE: 'Site entreprise',
  UNKNOWN: 'Site web',
};

export type ImportPlatformKey = keyof typeof IMPORT_PLATFORM_LABELS;

export interface ImportPlatformDef {
  key: ImportPlatformKey;
  label: string;
  Icon?: LucideIcon;
  brand?: 'linkedin';
  iconClassName: string;
}

export const IMPORT_PLATFORM_DEFS: ImportPlatformDef[] = [
  { key: 'LINKEDIN', label: 'LinkedIn', brand: 'linkedin', iconClassName: 'text-[#0A66C2]' },
  { key: 'INDEED', label: 'Indeed', Icon: Briefcase, iconClassName: 'text-[#2164f3]' },
  { key: 'REKRUTE', label: 'ReKrute', Icon: Building2, iconClassName: 'text-[#E87722]' },
  { key: 'EMPLOI_MA', label: 'Emploi.ma', Icon: MapPin, iconClassName: 'text-[#00A651]' },
  { key: 'NOVOJOB', label: 'Novojob', Icon: Users, iconClassName: 'text-[#0066CC]' },
  {
    key: 'COMPANY_WEBSITE',
    label: 'Site entreprise',
    Icon: Building2,
    iconClassName: 'text-[var(--admin-brand)]',
  },
  { key: 'UNKNOWN', label: 'Site web', Icon: Globe, iconClassName: 'text-[var(--admin-text-secondary)]' },
];

/** @deprecated Use IMPORT_PLATFORM_DEFS */
export const IMPORT_PLATFORMS = IMPORT_PLATFORM_DEFS.map((p) => p.label);

export const APPLICATION_METHOD_OPTIONS = [
  { value: 'internal', labelKey: 'internal' },
  { value: 'external', labelKey: 'external' },
  { value: 'email', labelKey: 'email' },
] as const;

export const VISIBILITY_OPTIONS = [
  { value: 'public', labelKey: 'public' },
  { value: 'targeted', labelKey: 'targeted' },
  { value: 'private', labelKey: 'private' },
] as const;

export const CREATION_METHOD_CARDS = [
  {
    key: 'manual' as const,
    icon: PenLine,
    titleKey: 'manual.title',
    badgeKey: 'manual.badge',
    descKey: 'manual.description',
    longDescKey: 'manual.longDesc',
    benefitsKey: 'manual.benefits',
    bestForKey: 'manual.bestFor',
    ctaKey: 'manual.cta',
  },
  {
    key: 'import' as const,
    icon: Link2,
    titleKey: 'import.title',
    badgeKey: 'import.badge',
    descKey: 'import.description',
    longDescKey: 'import.longDesc',
    benefitsKey: 'import.benefits',
    bestForKey: 'import.bestFor',
    ctaKey: 'import.cta',
  },
  {
    key: 'text' as const,
    icon: ClipboardList,
    titleKey: 'text.title',
    badgeKey: 'text.badge',
    descKey: 'text.description',
    longDescKey: 'text.longDesc',
    benefitsKey: 'text.benefits',
    bestForKey: 'text.bestFor',
    ctaKey: 'text.cta',
  },
] as const;
