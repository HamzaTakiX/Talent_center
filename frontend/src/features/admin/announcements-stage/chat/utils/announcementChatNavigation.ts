export function announcementViewPath(announcementUuid?: string | null): string | null {
  const id = announcementUuid?.trim();
  if (!id) return null;
  return `/admin/announcements/${id}`;
}
