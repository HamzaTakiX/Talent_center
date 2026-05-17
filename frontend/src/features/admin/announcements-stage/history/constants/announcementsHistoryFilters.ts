export const ANNOUNCEMENTS_AUDIENCE_SCOPES = [
  { value: 'all_programmes', labelKey: 'allProgrammes' },
  { value: 'm1_msc_bridge', labelKey: 'm1MscBridge' },
  { value: 'final_year_only', labelKey: 'finalYearOnly' },
  { value: 'product_track', labelKey: 'productTrack' },
  { value: 'finance_club', labelKey: 'financeClub' },
  { value: 'open_campus', labelKey: 'openCampus' },
  { value: 'legacy_intake', labelKey: 'legacyIntake' },
] as const;

export const ANNOUNCEMENTS_LIFECYCLE_FILTERS = [
  { value: 'scheduled', labelKey: 'scheduled' },
  { value: 'live', labelKey: 'live' },
  { value: 'archived', labelKey: 'archived' },
] as const;
