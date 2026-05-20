import {
  Award,
  Briefcase,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Shield,
  Stamp,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  'file-text': FileText,
  'graduation-cap': GraduationCap,
  briefcase: Briefcase,
  award: Award,
  wallet: Wallet,
  shield: Shield,
  stamp: Stamp,
  'file-spreadsheet': FileSpreadsheet,
};

export function resolveServiceIcon(key: string): LucideIcon {
  return MAP[key] ?? FileText;
}
