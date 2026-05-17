export interface AdminRow {
  name: string;
  role: string;
}

export const TOTAL_ADMINS_COUNT = 12;

export const adminsMockRows: AdminRow[] = [
  { name: 'Karim El Amrani', role: 'Admin Stage' },
  { name: 'Salma Benkirane', role: 'Admin Finance' },
  { name: 'Omar Tazi', role: 'Admin Documents' },
];
