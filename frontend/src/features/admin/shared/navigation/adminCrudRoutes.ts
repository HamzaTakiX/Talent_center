/** Chemins des pages CRUD admin (remplace les modales). */
export const adminCrudRoutes = {
  studentCreate: '/admin/students/create',
  studentEdit: (id: number | string) => `/admin/students/${id}/edit`,
  adminCreate: '/admin/admins/create-administrator',
  adminEdit: (id: string) => `/admin/admins/${id}/edit`,
  adminPermissions: (id: string) => `/admin/admins/${id}/permissions`,
  encadrantCreate: '/admin/encadrants/new',
  encadrantEdit: (id: number | string) => `/admin/encadrants/${id}/edit`,
  internshipOfferCreate: '/admin/internship-offers/create',
  internshipOfferEdit: (id: string) => `/admin/internship-offers/${id}/edit`,
  announcementCreate: '/admin/announcements/create',
  announcementEdit: (id: string) => `/admin/announcements/${id}/edit`,
  documentReview: (id: string) => `/admin/documents/${id}/review`,
} as const;
