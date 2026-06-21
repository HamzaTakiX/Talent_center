import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Briefcase,
  Bell,
  History,
  FileText,
  DollarSign,
  UserCheck,
  Users,
  Shield,
  MessageSquare,
  Plus,
  Settings,
  User,
  Moon,
  AlertTriangle,
  BarChart3,
  Activity,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Brain,
  Ban,
  Wallet,
  Upload,
  Settings2,
  GraduationCap,
  UserPlus,
  FilePlus,
  Megaphone,
  Table2,
  Filter,
  LogOut,
} from 'lucide-react';
import type { AdminSearchCategory, AdminSearchRegistryEntry } from '../types';

const e = (
  partial: Omit<AdminSearchRegistryEntry, 'id'> & { id: string }
): AdminSearchRegistryEntry => partial;

/** Central searchable index — extend here when adding admin routes or UI */
export const ADMIN_SEARCH_REGISTRY: AdminSearchRegistryEntry[] = [
  // ── Quick actions ──
  e({
    id: 'action-toggle-theme',
    titleKey: 'admin.globalSearch.actions.toggleTheme',
    category: 'action',
    actionId: 'toggle-theme',
    icon: Moon,
    priority: 100,
    keywords: ['dark', 'light', 'theme', 'mode', 'sombre', 'clair'],
  }),
  e({
    id: 'action-profile',
    titleKey: 'admin.userMenu.profile',
    subtitleKey: 'admin.globalSearch.subtitles.account',
    category: 'action',
    path: '/admin/profile',
    icon: User,
    priority: 90,
  }),
  e({
    id: 'action-settings',
    titleKey: 'admin.userMenu.settings',
    subtitleKey: 'admin.globalSearch.subtitles.account',
    category: 'action',
    path: '/admin/settings',
    icon: Settings,
    priority: 88,
  }),
  e({
    id: 'action-create-offer',
    titleKey: 'admin.globalSearch.actions.createOffer',
    category: 'action',
    path: '/admin/internship-offers/create',
    icon: Plus,
    priority: 85,
    keywords: ['new', 'offer', 'stage', 'internship', 'nouvelle', 'offre'],
  }),
  e({
    id: 'action-create-announcement',
    titleKey: 'admin.globalSearch.actions.createAnnouncement',
    category: 'action',
    path: '/admin/announcements/create',
    icon: Megaphone,
    priority: 84,
    keywords: ['new', 'annonce', 'announcement'],
  }),
  e({
    id: 'action-create-admin',
    titleKey: 'admin.globalSearch.actions.createAdministrator',
    category: 'action',
    path: '/admin/admins/create-administrator',
    icon: UserPlus,
    priority: 83,
  }),
  e({
    id: 'action-add-encadrant',
    titleKey: 'admin.globalSearch.actions.addEncadrant',
    category: 'action',
    path: '/admin/encadrants/new',
    icon: UserPlus,
    priority: 82,
    keywords: ['supervisor', 'encadrant', 'add'],
  }),

  // ── Main navigation (pages) ──
  e({ id: 'page-dashboard', titleKey: 'admin.nav.dashboard', category: 'page', path: '/admin/dashboard', icon: LayoutDashboard, priority: 95 }),
  e({ id: 'page-internship-offers', titleKey: 'admin.nav.internshipOffers', category: 'page', path: '/admin/internship-offers', icon: Briefcase, priority: 90 }),
  e({ id: 'page-announcements', titleKey: 'admin.nav.announcements', category: 'page', path: '/admin/announcements', icon: Bell, priority: 90 }),
  e({ id: 'page-history', titleKey: 'admin.nav.history', category: 'page', path: '/admin/history', icon: History, priority: 88 }),
  e({ id: 'page-documents', titleKey: 'admin.nav.documents', category: 'page', path: '/admin/documents', icon: FileText, priority: 88 }),
  e({ id: 'page-srf', titleKey: 'admin.nav.srf', category: 'page', path: '/admin/srf', icon: DollarSign, priority: 88, keywords: ['financial', 'financier', 'payment', 'paiement'] }),
  e({ id: 'page-encadrants', titleKey: 'admin.nav.encadrant', category: 'page', path: '/admin/encadrants', icon: UserCheck, priority: 88, keywords: ['supervisor', 'encadrant'] }),
  e({ id: 'page-students', titleKey: 'admin.nav.student', category: 'page', path: '/admin/students', icon: Users, priority: 88 }),
  e({ id: 'page-admins', titleKey: 'admin.nav.admin', category: 'page', path: '/admin/admins', icon: Shield, priority: 88 }),

  // ── Dashboard sections & KPI cards ──
  e({ id: 'section-dashboard-stats', titleKey: 'admin.dashboard.stats.aria', subtitleKey: 'admin.nav.dashboard', category: 'section', path: '/admin/dashboard', sectionId: 'dashboard-stats', icon: BarChart3, priority: 70 }),
  e({ id: 'section-dashboard-alerts', titleKey: 'admin.dashboard.alerts.title', subtitleKey: 'admin.nav.dashboard', category: 'section', path: '/admin/dashboard', sectionId: 'dashboard-alerts', icon: AlertTriangle, priority: 72 }),
  e({ id: 'section-dashboard-activity', titleKey: 'admin.dashboard.activity.title', subtitleKey: 'admin.nav.dashboard', category: 'section', path: '/admin/dashboard', sectionId: 'dashboard-activity', icon: Activity, priority: 68 }),
  e({ id: 'section-dashboard-chart', titleKey: 'admin.dashboard.chart.title', subtitleKey: 'admin.nav.dashboard', category: 'section', path: '/admin/dashboard', sectionId: 'dashboard-chart', icon: BarChart3, priority: 66 }),

  e({ id: 'card-total-students', titleKey: 'admin.dashboard.stats.totalStudents', category: 'card', path: '/admin/dashboard/students', icon: Users, priority: 75 }),
  e({ id: 'card-total-encadrants', titleKey: 'admin.dashboard.stats.totalEncadrants', category: 'card', path: '/admin/dashboard/encadrants', icon: UserCheck, priority: 75 }),
  e({ id: 'card-total-admins', titleKey: 'admin.dashboard.stats.totalAdmins', category: 'card', path: '/admin/dashboard/admins', icon: Shield, priority: 75 }),
  e({ id: 'card-students-without-internship', titleKey: 'admin.dashboard.stats.studentsWithoutInternship', category: 'card', path: '/admin/students-without-internship', icon: GraduationCap, priority: 78 }),
  e({ id: 'card-active-offers', titleKey: 'admin.dashboard.stats.activeInternshipOffers', category: 'card', path: '/admin/active-internship-offers', icon: Briefcase, priority: 78 }),
  e({ id: 'card-ongoing-applications', titleKey: 'admin.dashboard.stats.ongoingApplications', category: 'card', path: '/admin/ongoing-applications', icon: ClipboardList, priority: 78 }),
  e({ id: 'card-documents-pending', titleKey: 'admin.dashboard.stats.documentsPending', category: 'card', path: '/admin/documents-pending-validation', icon: FileText, priority: 78 }),
  e({ id: 'card-students-unpaid-srf', titleKey: 'admin.dashboard.stats.studentsUnpaidSrf', category: 'card', path: '/admin/students-unpaid-srf', icon: Wallet, priority: 78 }),

  // ── Internship offers ──
  e({ id: 'nav-offers-all', titleKey: 'admin.globalSearch.items.allOffers', subtitleKey: 'admin.nav.internshipOffers', category: 'navigation', path: '/admin/internship-offers/all', icon: Briefcase, priority: 65 }),
  e({ id: 'nav-offers-active', titleKey: 'admin.globalSearch.items.activeOffers', subtitleKey: 'admin.nav.internshipOffers', category: 'navigation', path: '/admin/internship-offers/active', icon: CheckCircle2, priority: 65 }),
  e({ id: 'nav-offers-expired', titleKey: 'admin.globalSearch.items.expiredOffers', subtitleKey: 'admin.nav.internshipOffers', category: 'navigation', path: '/admin/internship-offers/expired', icon: Clock, priority: 60 }),
  e({ id: 'nav-offers-draft', titleKey: 'admin.globalSearch.items.draftOffers', subtitleKey: 'admin.nav.internshipOffers', category: 'navigation', path: '/admin/internship-offers/draft', icon: FileText, priority: 60 }),
  e({ id: 'nav-offers-drafts', titleKey: 'admin.nav.drafts', subtitleKey: 'admin.nav.internshipOffers', category: 'navigation', path: '/admin/internship-offers/drafts', icon: FileText, priority: 59 }),
  e({ id: 'nav-offers-closed', titleKey: 'admin.globalSearch.items.closedOffers', subtitleKey: 'admin.nav.internshipOffers', category: 'navigation', path: '/admin/internship-offers/closed', icon: XCircle, priority: 60 }),
  e({ id: 'nav-offers-applications', titleKey: 'admin.globalSearch.items.offersWithApplications', subtitleKey: 'admin.nav.internshipOffers', category: 'navigation', path: '/admin/internship-offers/with-applications', icon: ClipboardList, priority: 62 }),
  e({ id: 'nav-offers-chat', titleKey: 'admin.nav.chat', subtitleKey: 'admin.nav.internshipOffers', category: 'navigation', path: '/admin/internship-offers/chat', icon: MessageSquare, priority: 58 }),
  e({ id: 'nav-offers-history', titleKey: 'admin.nav.history', subtitleKey: 'admin.nav.internshipOffers', category: 'navigation', path: '/admin/internship-offers/history', icon: History, priority: 58 }),

  // ── Announcements ──
  e({ id: 'nav-announcements-all', titleKey: 'admin.globalSearch.items.allAnnouncements', subtitleKey: 'admin.nav.announcements', category: 'navigation', path: '/admin/announcements/all', icon: Bell, priority: 65 }),
  e({ id: 'nav-announcements-active', titleKey: 'admin.globalSearch.items.activeAnnouncements', subtitleKey: 'admin.nav.announcements', category: 'navigation', path: '/admin/announcements/active', icon: CheckCircle2, priority: 65 }),
  e({ id: 'nav-announcements-chat', titleKey: 'admin.nav.chat', subtitleKey: 'admin.nav.announcements', category: 'navigation', path: '/admin/announcements/chat', icon: MessageSquare, priority: 58 }),
  e({ id: 'nav-announcements-history', titleKey: 'admin.nav.history', subtitleKey: 'admin.nav.announcements', category: 'navigation', path: '/admin/announcements/history', icon: History, priority: 58 }),

  // ── Global history cards ──
  e({ id: 'history-total-actions', titleKey: 'admin.globalSearch.items.totalActions', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/total-actions', icon: History, priority: 62 }),
  e({ id: 'history-students', titleKey: 'admin.globalSearch.items.studentsHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/students', icon: Users, priority: 62 }),
  e({ id: 'history-admins', titleKey: 'admin.globalSearch.items.adminsHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/admins', icon: Shield, priority: 62 }),
  e({ id: 'history-encadrants', titleKey: 'admin.globalSearch.items.encadrantsHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/encadrants', icon: UserCheck, priority: 62 }),
  e({ id: 'history-offers', titleKey: 'admin.globalSearch.items.offersHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/internship-offers', icon: Briefcase, priority: 62 }),
  e({ id: 'history-applications', titleKey: 'admin.globalSearch.items.applicationsHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/applications', icon: ClipboardList, priority: 60 }),
  e({ id: 'history-announcements', titleKey: 'admin.globalSearch.items.announcementsHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/announcements', icon: Bell, priority: 60 }),
  e({ id: 'history-documents', titleKey: 'admin.globalSearch.items.documentsHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/documents', icon: FileText, priority: 60 }),
  e({ id: 'history-srf', titleKey: 'admin.globalSearch.items.srfHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/srf', icon: DollarSign, priority: 60 }),
  e({ id: 'history-chat', titleKey: 'admin.globalSearch.items.chatHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/chat', icon: MessageSquare, priority: 58 }),
  e({ id: 'history-reports', titleKey: 'admin.globalSearch.items.reportsHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/reports', icon: FileText, priority: 58 }),
  e({ id: 'history-tasks', titleKey: 'admin.globalSearch.items.tasksHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/tasks', icon: ClipboardList, priority: 56 }),
  e({ id: 'history-meetings', titleKey: 'admin.globalSearch.items.meetingsHistory', subtitleKey: 'admin.nav.history', category: 'card', path: '/admin/history/meetings', icon: Clock, priority: 56 }),

  // ── Documents ──
  e({ id: 'nav-documents-all', titleKey: 'admin.globalSearch.items.allDocuments', subtitleKey: 'admin.nav.documents', category: 'navigation', path: '/admin/documents/all', icon: FileText, priority: 65 }),
  e({ id: 'nav-documents-pending', titleKey: 'admin.globalSearch.items.pendingDocuments', subtitleKey: 'admin.nav.documents', category: 'navigation', path: '/admin/documents/pending', icon: Clock, priority: 68 }),
  e({ id: 'nav-documents-validated', titleKey: 'admin.globalSearch.items.validatedDocuments', subtitleKey: 'admin.nav.documents', category: 'navigation', path: '/admin/documents/validated', icon: CheckCircle2, priority: 62 }),
  e({ id: 'nav-documents-rejected', titleKey: 'admin.globalSearch.items.rejectedDocuments', subtitleKey: 'admin.nav.documents', category: 'navigation', path: '/admin/documents/rejected', icon: XCircle, priority: 62 }),
  e({ id: 'nav-documents-catalog', titleKey: 'admin.nav.catalog', subtitleKey: 'admin.nav.documents', category: 'navigation', path: '/admin/documents/catalog', icon: FileText, priority: 64, keywords: ['service', 'catalogue', 'configuration', 'document type'] }),
  e({ id: 'nav-documents-chat', titleKey: 'admin.nav.chat', subtitleKey: 'admin.nav.documents', category: 'navigation', path: '/admin/documents/chat', icon: MessageSquare, priority: 58 }),
  e({ id: 'nav-documents-history', titleKey: 'admin.nav.history', subtitleKey: 'admin.nav.documents', category: 'navigation', path: '/admin/documents/history', icon: History, priority: 58 }),

  // ── SRF ──
  e({ id: 'nav-srf-paid', titleKey: 'admin.globalSearch.items.paidStudents', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/paid-students', icon: CheckCircle2, priority: 65 }),
  e({ id: 'nav-srf-unpaid', titleKey: 'admin.globalSearch.items.unpaidStudents', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/unpaid-students', icon: Wallet, priority: 68 }),
  e({ id: 'nav-srf-partial', titleKey: 'admin.globalSearch.items.partiallyPaid', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/partially-paid', icon: DollarSign, priority: 62 }),
  e({ id: 'nav-srf-pending', titleKey: 'admin.globalSearch.items.pendingValidation', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/pending-validation', icon: Clock, priority: 62 }),
  e({ id: 'nav-srf-late', titleKey: 'admin.globalSearch.items.latePayments', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/late-payments', icon: AlertTriangle, priority: 65 }),
  e({ id: 'nav-srf-blocked', titleKey: 'admin.globalSearch.items.blockedStudents', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/blocked-students', icon: Ban, priority: 62 }),
  e({ id: 'nav-srf-exempted', titleKey: 'admin.globalSearch.items.exemptedStudents', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/exempted-students', icon: User, priority: 58 }),
  e({ id: 'nav-srf-config', titleKey: 'admin.nav.config', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/config', icon: Settings2, priority: 72, keywords: ['exam', 'warning', 'notification', 'config', 'srf', 'restriction'] }),
  e({ id: 'nav-srf-imports', titleKey: 'admin.nav.imports', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/imports', icon: Upload, priority: 70, keywords: ['import', 'financial', 'erp', 'csv', 'excel'] }),
  e({ id: 'nav-srf-chat', titleKey: 'admin.nav.chat', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/chat', icon: MessageSquare, priority: 58 }),
  e({ id: 'nav-srf-history', titleKey: 'admin.nav.history', subtitleKey: 'admin.nav.srf', category: 'navigation', path: '/admin/srf/history', icon: History, priority: 58 }),

  // ── Students ──
  e({ id: 'nav-students-total', titleKey: 'admin.globalSearch.items.totalStudents', subtitleKey: 'admin.nav.student', category: 'navigation', path: '/admin/students/total-students', icon: Users, priority: 65 }),
  e({ id: 'nav-students-active', titleKey: 'admin.globalSearch.items.activeStudents', subtitleKey: 'admin.nav.student', category: 'navigation', path: '/admin/students/active-students', icon: CheckCircle2, priority: 65 }),
  e({ id: 'nav-students-without', titleKey: 'admin.globalSearch.items.withoutInternship', subtitleKey: 'admin.nav.student', category: 'navigation', path: '/admin/students/without-internship', icon: GraduationCap, priority: 68 }),
  e({ id: 'nav-students-with', titleKey: 'admin.globalSearch.items.withInternship', subtitleKey: 'admin.nav.student', category: 'navigation', path: '/admin/students/with-internship', icon: Briefcase, priority: 62 }),
  e({ id: 'nav-students-engagement', titleKey: 'admin.globalSearch.items.engagementLevel', subtitleKey: 'admin.nav.student', category: 'navigation', path: '/admin/students/engagement-level', icon: Activity, priority: 60 }),
  e({ id: 'nav-students-chat', titleKey: 'admin.nav.chat', subtitleKey: 'admin.nav.student', category: 'navigation', path: '/admin/student/chat', icon: MessageSquare, priority: 58 }),

  // ── Encadrants ──
  e({ id: 'nav-encadrants-all', titleKey: 'admin.globalSearch.items.allEncadrants', subtitleKey: 'admin.nav.encadrant', category: 'navigation', path: '/admin/encadrants/all', icon: UserCheck, priority: 65 }),
  e({ id: 'nav-encadrants-assigned', titleKey: 'admin.globalSearch.items.assignedStudents', subtitleKey: 'admin.nav.encadrant', category: 'navigation', path: '/admin/encadrants/assigned-students', icon: Users, priority: 62 }),
  e({ id: 'nav-encadrants-reports', titleKey: 'admin.globalSearch.items.reportsInProgress', subtitleKey: 'admin.nav.encadrant', category: 'navigation', path: '/admin/encadrant/reports/in-progress', icon: FileText, priority: 62 }),
  e({ id: 'nav-encadrants-meetings', titleKey: 'admin.globalSearch.items.upcomingMeetings', subtitleKey: 'admin.nav.encadrant', category: 'navigation', path: '/admin/encadrants/upcoming-meetings', icon: Clock, priority: 62 }),
  e({ id: 'nav-encadrants-history', titleKey: 'admin.nav.history', subtitleKey: 'admin.nav.encadrant', category: 'navigation', path: '/admin/encadrants/history', icon: History, priority: 58 }),
  e({ id: 'nav-encadrants-meetings-history', titleKey: 'admin.nav.history', subtitleKey: 'admin.nav.meetings', category: 'navigation', path: '/admin/encadrant/meetings/history', icon: History, priority: 56 }),
  e({ id: 'nav-encadrants-smart-assignment-history', titleKey: 'admin.nav.history', subtitleKey: 'admin.nav.smartAssignment', category: 'navigation', path: '/admin/encadrant/smart-assignment/history', icon: History, priority: 56 }),
  e({ id: 'nav-encadrants-chat', titleKey: 'admin.nav.chat', subtitleKey: 'admin.nav.encadrant', category: 'navigation', path: '/admin/encadrant/chat', icon: MessageSquare, priority: 58 }),
  e({ id: 'nav-encadrants-reports-page', titleKey: 'admin.nav.reports', subtitleKey: 'admin.nav.encadrant', category: 'navigation', path: '/admin/encadrant/reports', icon: FileText, priority: 60 }),
  e({ id: 'nav-encadrants-smart-assignment', titleKey: 'admin.nav.smartAssignment', subtitleKey: 'admin.nav.encadrant', category: 'navigation', path: '/admin/encadrant/smart-assignment', icon: Brain, priority: 60 }),

  // ── Administrators ──
  e({ id: 'nav-admins-all', titleKey: 'admin.globalSearch.items.allAdministrators', subtitleKey: 'admin.nav.admin', category: 'navigation', path: '/admin/admins', icon: Shield, priority: 65 }),
  e({ id: 'nav-admins-stage', titleKey: 'admin.globalSearch.items.stageAdministrators', subtitleKey: 'admin.nav.admin', category: 'navigation', path: '/admin/admins/stage-administrators', icon: Briefcase, priority: 60 }),
  e({ id: 'nav-admins-finance', titleKey: 'admin.globalSearch.items.financeAdministrators', subtitleKey: 'admin.nav.admin', category: 'navigation', path: '/admin/admins/finance-administrators', icon: DollarSign, priority: 60 }),
  e({ id: 'nav-admins-documents', titleKey: 'admin.globalSearch.items.documentsAdministrators', subtitleKey: 'admin.nav.admin', category: 'navigation', path: '/admin/admins/documents-administrators', icon: FileText, priority: 60 }),
  e({ id: 'nav-admins-communication', titleKey: 'admin.globalSearch.items.communicationAdministrators', subtitleKey: 'admin.nav.admin', category: 'navigation', path: '/admin/admins/communication-administrators', icon: MessageSquare, priority: 60 }),
  e({ id: 'nav-admins-chat', titleKey: 'admin.nav.chat', subtitleKey: 'admin.nav.admin', category: 'navigation', path: '/admin/sous-admin/chat', icon: MessageSquare, priority: 58 }),

  // ── Settings & account tabs ──
  e({ id: 'setting-language', titleKey: 'admin.settings.language.title', subtitleKey: 'admin.userMenu.settings', category: 'setting', path: '/admin/profile', sectionId: 'settings-language', icon: Settings, priority: 55 }),
  e({ id: 'setting-notifications', titleKey: 'admin.settings.notifications.title', subtitleKey: 'admin.userMenu.settings', category: 'setting', path: '/admin/profile', sectionId: 'settings-notifications', icon: Bell, priority: 55 }),
  e({ id: 'setting-appearance', titleKey: 'admin.settings.appearance.title', subtitleKey: 'admin.userMenu.settings', category: 'setting', path: '/admin/profile', sectionId: 'settings-appearance', icon: Moon, priority: 55 }),
  e({ id: 'setting-preferences', titleKey: 'admin.settings.preferences.title', subtitleKey: 'admin.userMenu.settings', category: 'setting', path: '/admin/profile', sectionId: 'settings-preferences', icon: Filter, priority: 52 }),
  e({ id: 'tab-profile', titleKey: 'admin.account.tabs.profile', subtitleKey: 'admin.account.title', category: 'tab', path: '/admin/profile', icon: User, priority: 58 }),
  e({ id: 'tab-settings', titleKey: 'admin.account.tabs.settings', subtitleKey: 'admin.account.title', category: 'tab', path: '/admin/settings', icon: Settings, priority: 58 }),
  e({ id: 'form-profile-info', titleKey: 'admin.account.personalInfo.title', subtitleKey: 'admin.account.tabs.profile', category: 'form', path: '/admin/profile', sectionId: 'profile-personal-info', icon: User, priority: 50 }),
  e({ id: 'form-profile-security', titleKey: 'admin.account.security.title', subtitleKey: 'admin.account.tabs.profile', category: 'form', path: '/admin/profile', sectionId: 'profile-security', icon: Shield, priority: 50 }),

  // ── Features & tables (semantic discovery) ──
  e({ id: 'feature-notifications', titleKey: 'admin.notifications.title', category: 'feature', path: '/admin/dashboard', keywords: ['alert', 'notification', 'bell'], icon: Bell, priority: 45 }),
  e({ id: 'table-students', titleKey: 'admin.globalSearch.items.studentsTable', subtitleKey: 'admin.nav.student', category: 'table', path: '/admin/students', icon: Table2, priority: 48 }),
  e({ id: 'table-encadrants', titleKey: 'admin.globalSearch.items.encadrantsTable', subtitleKey: 'admin.nav.encadrant', category: 'table', path: '/admin/encadrants', icon: Table2, priority: 48 }),
  e({ id: 'table-documents', titleKey: 'admin.globalSearch.items.documentsTable', subtitleKey: 'admin.nav.documents', category: 'table', path: '/admin/documents', icon: Table2, priority: 48 }),
  e({ id: 'table-srf', titleKey: 'admin.globalSearch.items.srfTable', subtitleKey: 'admin.nav.srf', category: 'table', path: '/admin/srf', icon: Table2, priority: 48 }),
  e({ id: 'feature-logout', titleKey: 'admin.userMenu.logout', category: 'feature', keywords: ['sign out', 'deconnexion', 'exit'], icon: LogOut, priority: 30 }),
  e({ id: 'feature-create-document', titleKey: 'admin.globalSearch.items.uploadDocument', category: 'feature', path: '/admin/documents', icon: FilePlus, priority: 42 }),
];

export const getRegistryEntryById = (id: string): AdminSearchRegistryEntry | undefined =>
  ADMIN_SEARCH_REGISTRY.find((entry) => entry.id === id);
