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

export const internshipOffersStatColorMap: InternshipOffersStatColorMap = {
  applications: 'bg-[#2b7fff]',
  pending: 'bg-[#eab308]',
  accepted: 'bg-[#22c55e]',
  rejected: 'bg-[#fb2c36]',
};
