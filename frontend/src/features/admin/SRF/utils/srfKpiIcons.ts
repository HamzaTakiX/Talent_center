import {
  AlertTriangle,
  Award,
  Ban,
  CheckCircle,
  Clock,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export const SRF_KPI_ICON_MAP: Record<string, { Icon: LucideIcon; iconBgClass: string }> = {
  paid: { Icon: CheckCircle, iconBgClass: 'bg-[#22c55e]' },
  unpaid: { Icon: XCircle, iconBgClass: 'bg-[#ef4444]' },
  partial: { Icon: Clock, iconBgClass: 'bg-[#f97316]' },
  pending_validation: { Icon: AlertTriangle, iconBgClass: 'bg-[#eab308]' },
  late: { Icon: AlertTriangle, iconBgClass: 'bg-[#f43f5e]' },
  blocked: { Icon: Ban, iconBgClass: 'bg-[#475569]' },
  exempted: { Icon: Award, iconBgClass: 'bg-[#2b7fff]' },
};
