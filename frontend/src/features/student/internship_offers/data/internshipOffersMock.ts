import { CheckCircle2, Clock, Send, XCircle } from 'lucide-react';
import type {
  InternshipOffer,
  InternshipOffersStatColorMap,
  InternshipOffersStatIconMap,
  InternshipOffersStatItem,
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

export const internshipOffersStats: InternshipOffersStatItem[] = [
  { label: 'Total Applications', value: '12', iconKey: 'applications' },
  { label: 'Pending', value: '7', iconKey: 'pending' },
  { label: 'Accepted', value: '3', iconKey: 'accepted' },
  { label: 'Rejected', value: '2', iconKey: 'rejected' },
];

export const allInternshipOffers: InternshipOffer[] = [
  {
    id: 'io1',
    title: 'Digital Marketing Intern',
    company: 'Maroc Telecom',
    location: 'Casablanca',
    tags: ['Marketing', 'Digital', 'Strategy'],
    matchPercent: 95,
    category: 'Marketing',
  },
  {
    id: 'io2',
    title: 'Business Development Intern',
    company: 'OCP Group',
    location: 'Casablanca',
    tags: ['Business Dev', 'Strategy', 'Sales'],
    matchPercent: 92,
    category: 'Business',
  },
  {
    id: 'io3',
    title: 'Brand Management Intern',
    company: 'Coca-Cola Maroc',
    location: 'Casablanca',
    tags: ['Branding', 'Marketing', 'Strategy'],
    matchPercent: 88,
    category: 'Marketing',
  },
  {
    id: 'io4',
    title: 'Financial Analyst Intern',
    company: 'Attijariwafa Bank',
    location: 'Casablanca',
    tags: ['Finance', 'Analysis', 'Banking'],
    matchPercent: 90,
    category: 'Finance',
  },
  {
    id: 'io5',
    title: 'HR Management Intern',
    company: 'BMCE Bank',
    location: 'Rabat',
    tags: ['HR', 'Recruitment', 'Training'],
    matchPercent: 85,
    category: 'HR',
  },
  {
    id: 'io6',
    title: 'Management Consulting Intern',
    company: 'Deloitte Morocco',
    location: 'Casablanca',
    tags: ['Consulting', 'Strategy', 'Management'],
    matchPercent: 93,
    category: 'Consulting',
  },
];

/** Sous-ensemble affiché sur la page principale Internship Offers. */
export const recommendedInternshipOffers: InternshipOffer[] = allInternshipOffers.slice(0, 4);
