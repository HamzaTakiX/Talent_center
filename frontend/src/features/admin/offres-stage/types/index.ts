export interface InternshipOffer {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string | null;
  status: 'Active' | 'Draft' | 'Expired' | 'Closed' | 'Archived';
  applicants: number;
  deadline: string;
  applicationDeadline?: string | null;
  publishReadinessScore?: number | null;
  publishReady?: boolean | null;
  draftWorkflowStatus?: 'draft' | 'pending_review';
}

export type OfferApplicationStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Interview';

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

export interface PopularOfferBrief {
  uuid: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string | null;
  locationCity?: string | null;
  applicationDeadline?: string | null;
  viewCount: number;
  applicationCount: number;
}

export interface InternshipOfferStat {
  label: string;
  labelKey?: string;
  valueKey?: string;
  statKey?: string;
  value: string;
  icon: string;
  popularOffer?: PopularOfferBrief;
}
