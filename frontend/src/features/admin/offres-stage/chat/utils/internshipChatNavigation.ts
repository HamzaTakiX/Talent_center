type InternshipChatNavTarget = {
  studentProfileId?: number;
  offerUuid?: string;
  applicationUuid?: string;
};

export function internshipStudentPath(studentProfileId?: number): string | null {
  if (!studentProfileId) return null;
  return `/admin/students/${studentProfileId}/edit`;
}

export function internshipOfferPath(offerUuid?: string): string | null {
  if (!offerUuid) return null;
  return `/admin/internship-offers/${offerUuid}`;
}

export function internshipApplicationPath(target: InternshipChatNavTarget): string | null {
  const offerPath = internshipOfferPath(target.offerUuid);
  if (!offerPath) return null;
  if (!target.applicationUuid) return offerPath;
  return `${offerPath}?application=${encodeURIComponent(target.applicationUuid)}`;
}
