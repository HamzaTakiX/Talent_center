export interface ReportOutlineItem {
  id: string;
  parentId: string | null;
  title: string;
  order: number;
  level: 1 | 2 | 3;
}
