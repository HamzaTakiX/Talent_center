export type AnnouncementsTimelineStatus =
  | 'announcement_created'
  | 'announcement_published'
  | 'deadline_adjusted'
  | 'audience_changed'
  | 'announcement_archived'
  | 'competition_rollout'
  | 'interview_wave';

export interface AnnouncementsTimelineRow {
  id: string;
  status: AnnouncementsTimelineStatus;
  actorName: string;
  headline: string;
  venueOrChannel: string;
  date: string;
  time: string;
  audienceScope:
    | 'all_programmes'
    | 'm1_msc_bridge'
    | 'final_year_only'
    | 'product_track'
    | 'finance_club'
    | 'open_campus'
    | 'legacy_intake';
  lifecycle: 'scheduled' | 'live' | 'archived';
}

export const announcementsHistorySeed: AnnouncementsTimelineRow[] = [
  {
    id: 'ah1',
    status: 'announcement_created',
    actorName: 'Comms Squad',
    headline: 'Draft — Spring hiring sprint brief',
    venueOrChannel: 'Internal playbook #SPR-ANN-41',
    date: '02/05/2026',
    time: '06:58',
    audienceScope: 'all_programmes',
    lifecycle: 'scheduled',
  },
  {
    id: 'ah2',
    status: 'announcement_published',
    actorName: 'Admin',
    headline: 'Published digest — mentorship office hours',
    venueOrChannel: 'Portal carousel + Moodle banner',
    date: '02/05/2026',
    time: '07:51',
    audienceScope: 'm1_msc_bridge',
    lifecycle: 'live',
  },
  {
    id: 'ah3',
    status: 'audience_changed',
    actorName: 'Student Affairs',
    headline: 'Narrowed target to graduating engineers',
    venueOrChannel: 'Push notification cohort B',
    date: '02/05/2026',
    time: '08:06',
    audienceScope: 'final_year_only',
    lifecycle: 'live',
  },
  {
    id: 'ah4',
    status: 'deadline_adjusted',
    actorName: 'Program Lead',
    headline: 'Competition submission window −12h slip',
    venueOrChannel: 'Innovathon 2026 — rulebook v3',
    date: '02/05/2026',
    time: '09:15',
    audienceScope: 'product_track',
    lifecycle: 'live',
  },
  {
    id: 'ah5',
    status: 'interview_wave',
    actorName: 'Forum moderators',
    headline: 'Batch invite — mock interview wave #2',
    venueOrChannel: 'Zoom breakout template',
    date: '01/05/2026',
    time: '20:41',
    audienceScope: 'finance_club',
    lifecycle: 'live',
  },
  {
    id: 'ah6',
    status: 'competition_rollout',
    actorName: 'Partnerships',
    headline: 'Assets swapped — sponsor leaderboard live',
    venueOrChannel: 'Arena microsite widgets',
    date: '30/04/2026',
    time: '16:07',
    audienceScope: 'open_campus',
    lifecycle: 'live',
  },
  {
    id: 'ah7',
    status: 'announcement_archived',
    actorName: 'Archivist Bot',
    headline: 'Retired stale winter bulletin',
    venueOrChannel: 'CDN purge + searchable archive bucket',
    date: '29/04/2026',
    time: '22:59',
    audienceScope: 'legacy_intake',
    lifecycle: 'archived',
  },
];
