export interface InternshipOffer {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string | null;
  status: 'Active' | 'Draft' | 'Expired' | 'Closed';
  applicants: number;
  deadline: string;
  publishReadinessScore?: number | null;
  publishReady?: boolean | null;
}

export type OfferApplicationStatus = 'Pending' | 'Accepted';

export interface OfferApplicantRow {
  id: string;
  studentName: string;
  classLabel: string;
  field: string;
  matchScore: number;
  status: OfferApplicationStatus;
}

export interface InternshipOfferDetail extends InternshipOffer {
  location: string;
  postedOn: string;
  description: string;
  skills: string[];
  studentApplications: OfferApplicantRow[];
}

export interface InternshipOfferStat {
  label: string;
  labelKey?: string;
  valueKey?: string;
  statKey?: string;
  value: string;
  icon: string;
}
