export interface AdminNotification {
  id: string;
  titleKey: string;
  messageKey: string;
  timeKey: string;
  timeCount?: number;
  read: boolean;
}

export const initialAdminNotifications: AdminNotification[] = [
  {
    id: '1',
    titleKey: 'pendingDocuments',
    messageKey: 'pendingDocumentsMsg',
    timeKey: 'minutesAgo',
    timeCount: 12,
    read: false,
  },
  {
    id: '2',
    titleKey: 'unpaidSrf',
    messageKey: 'unpaidSrfMsg',
    timeKey: 'hoursAgo',
    timeCount: 1,
    read: false,
  },
  {
    id: '3',
    titleKey: 'expiringOffers',
    messageKey: 'expiringOffersMsg',
    timeKey: 'hoursAgo',
    timeCount: 3,
    read: false,
  },
  {
    id: '4',
    titleKey: 'newApplication',
    messageKey: 'newApplicationMsg',
    timeKey: 'yesterday',
    read: true,
  },
];
