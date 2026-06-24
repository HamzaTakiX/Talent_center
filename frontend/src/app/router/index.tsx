import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from '../../features/auth/pages/LoginPage';
import ConfirmIdentityPage from '../../features/auth/pages/ConfirmIdentityPage';
import CompleteProfilePage from '../../features/auth/pages/CompleteProfilePage';
import CallbackPage from '../../features/auth/pages/CallbackPage';
import AccessDeniedPage from '../../features/auth/pages/AccessDeniedPage';

// Admin Pages
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage';
import InternshipOffersPage from '../../features/admin/offres-stage/pages/InternshipOffersPage';
import CreateInternshipOfferPage from '../../features/admin/offres-stage/pages/CreateInternshipOfferPage';
import ViewInternshipOfferPage from '../../features/admin/offres-stage/pages/ViewInternshipOfferPage';
import AllInternshipOffersListPage from '../../features/admin/pages/AllInternshipOffersListPage';
import InternshipActiveOffersListPage from '../../features/admin/pages/InternshipActiveOffersListPage';
import InternshipExpiredOffersListPage from '../../features/admin/pages/InternshipExpiredOffersListPage';
import InternshipDraftOffersListPage from '../../features/admin/pages/InternshipDraftOffersListPage';
import InternshipClosedOffersListPage from '../../features/admin/pages/InternshipClosedOffersListPage';
import InternshipArchivedOffersListPage from '../../features/admin/pages/InternshipArchivedOffersListPage';
import InternshipOffersWithApplicationsListPage from '../../features/admin/pages/InternshipOffersWithApplicationsListPage';
import InternshipOffersChatPage from '../../features/admin/pages/InternshipOffersChatPage';
import InternshipOffersDraftsPage from '../../features/admin/pages/InternshipOffersDraftsPage';
import InternshipOffersHistoryPage from '../../features/admin/pages/InternshipOffersHistoryPage';
import AnnouncementsPage from '../../features/admin/announcements-stage/pages/AnnouncementsPage';
import AllAnnouncementsListPage from '../../features/admin/pages/AllAnnouncementsListPage';
import ActiveAnnouncementsListPage from '../../features/admin/pages/ActiveAnnouncementsListPage';
import CreateAnnouncementPage from '../../features/admin/announcements-stage/pages/CreateAnnouncementPage';
import ViewAnnouncementPage from '../../features/admin/announcements-stage/pages/ViewAnnouncementPage';
import EditAnnouncementPage from '../../features/admin/announcements-stage/pages/EditAnnouncementPage';
import AnnouncementsChatPage from '../../features/admin/announcements-stage/chat/pages/AnnouncementsChatPage';
import AnnouncementsHistoryPage from '../../features/admin/announcements-stage/history/pages/AnnouncementsHistoryPage';
import AnnouncementTypesPage from '../../features/admin/announcements-stage/pages/AnnouncementTypesPage';
import AnnouncementsAnalyticsPage from '../../features/admin/announcements-stage/pages/AnnouncementsAnalyticsPage';
import AnnouncementsInsightsPage from '../../features/admin/announcements-stage/pages/AnnouncementsInsightsPage';
import AnnouncementsEngagementPage from '../../features/admin/announcements-stage/pages/AnnouncementsEngagementPage';
import ScheduledAnnouncementsPage from '../../features/admin/announcements-stage/pages/ScheduledAnnouncementsPage';
import ArchivedAnnouncementsPage from '../../features/admin/announcements-stage/pages/ArchivedAnnouncementsPage';
import DocumentsPage from '../../features/admin/Documents_admin/pages/DocumentsPage';
import AllDocumentsListPage from '../../features/admin/Documents_admin/Documents_cards/all-documents/pages/AllDocumentsListPage';
import PendingDocumentsListPage from '../../features/admin/Documents_admin/Documents_cards/pending-documents/pages/PendingDocumentsListPage';
import ValidatedDocumentsListPage from '../../features/admin/Documents_admin/Documents_cards/validated-documents/pages/ValidatedDocumentsListPage';
import RejectedDocumentsListPage from '../../features/admin/Documents_admin/Documents_cards/rejected-documents/pages/RejectedDocumentsListPage';
import DocumentsChatPage from '../../features/admin/Documents_admin/chat/pages/DocumentsChatPage';
import DocumentsHistoryPage from '../../features/admin/Documents_admin/history/pages/DocumentsHistoryPage';
import StudentFinancialStatusPage from '../../features/admin/SRF/pages/StudentFinancialStatusPage';
import PaidStudentsDetailPage from '../../features/admin/SRF/srf_cards/paid-students/pages/PaidStudentsDetailPage';
import UnpaidStudentsDetailPage from '../../features/admin/SRF/srf_cards/unpaid-students/pages/UnpaidStudentsDetailPage';
import PartiallyPaidDetailPage from '../../features/admin/SRF/srf_cards/partially-paid/pages/PartiallyPaidDetailPage';
import PendingValidationDetailPage from '../../features/admin/SRF/srf_cards/pending-validation/pages/PendingValidationDetailPage';
import LatePaymentsDetailPage from '../../features/admin/SRF/srf_cards/late-payments/pages/LatePaymentsDetailPage';
import BlockedStudentsDetailPage from '../../features/admin/SRF/srf_cards/blocked-students/pages/BlockedStudentsDetailPage';
import ExemptedStudentsDetailPage from '../../features/admin/SRF/srf_cards/exempted-students/pages/ExemptedStudentsDetailPage';
import SRFChatPage from '../../features/admin/SRF/chat/pages/SRFChatPage';
import FinancialImportCenterPage from '../../features/admin/SRF/import/pages/FinancialImportCenterPage';
import SrfNotificationsConfigPage from '../../features/admin/SRF/config/pages/SrfNotificationsConfigPage';
import StudentFinancialDetailPage from '../../features/admin/SRF/pages/StudentFinancialDetailPage';
import PaymentValidationPage from '../../features/admin/SRF/pages/PaymentValidationPage';
import SrfHistoryPage from '../../features/admin/SRF/history/pages/SrfHistoryPage';
import EncadrantsHistoryPage from '../../features/admin/encadrant/history/pages/EncadrantsHistoryPage';
import MeetingsHistoryPage from '../../features/admin/encadrant/meetings/history/pages/MeetingsHistoryPage';
import SmartAssignmentHistoryPage from '../../features/admin/encadrant/smart-assignment/history/pages/SmartAssignmentHistoryPage';
import EncadrantChatPage from '../../features/admin/encadrant/chat/pages/EncadrantChatPage';
import EncadrantReportsPage from '../../features/admin/encadrant/reports/pages/EncadrantReportsPage';
import ReportsInProgressListPage from '../../features/admin/encadrant/reports/pages/ReportsInProgressListPage';
import ReportsPendingListPage from '../../features/admin/encadrant/reports/pages/ReportsPendingListPage';
import ReportsApprovedListPage from '../../features/admin/encadrant/reports/pages/ReportsApprovedListPage';
import ReportsOverdueListPage from '../../features/admin/encadrant/reports/pages/ReportsOverdueListPage';
import ReportsCriticalListPage from '../../features/admin/encadrant/reports/pages/ReportsCriticalListPage';
import ReportsPendingValidationListPage from '../../features/admin/encadrant/reports/pages/ReportsPendingValidationListPage';
import ReportsRiskAlertsListPage from '../../features/admin/encadrant/reports/pages/ReportsRiskAlertsListPage';
import SupervisionReportDetailPage from '../../features/admin/encadrant/reports/pages/SupervisionReportDetailPage';
import EncadrantMeetingsPage from '../../features/admin/encadrant/meetings/pages/EncadrantMeetingsPage';
import MeetingsChatPage from '../../features/admin/encadrant/meetings/chat/pages/MeetingsChatPage';
import SupervisionMeetingDetailPage from '../../features/admin/encadrant/meetings/pages/SupervisionMeetingDetailPage';
import StudentChatPage from '../../features/admin/student/chat/pages/StudentChatPage';
import SousAdminChatPage from '../../features/admin/sous_Admin/pages/SousAdminChatPage';
import AllStudentsPage from '../../features/admin/pages/AllStudentsPage';
import CreateStudentPage from '../../features/admin/student/pages/CreateStudentPage';
import EditStudentPage from '../../features/admin/student/pages/EditStudentPage';
import EditInternshipOfferPage from '../../features/admin/offres-stage/pages/EditInternshipOfferPage';
import EditAdministratorPage from '../../features/admin/sous_Admin/pages/EditAdministratorPage';
import AssignAdminPermissionsPage from '../../features/admin/sous_Admin/pages/AssignAdminPermissionsPage';
import EditEncadrantPage from '../../features/admin/encadrant/pages/EditEncadrantPage';
import ReviewDocumentPage from '../../features/admin/Documents_admin/pages/ReviewDocumentPage';
import AllRequestsPage from '../../features/admin/Documents_admin/pages/AllRequestsPage';
import RequestDetailPage from '../../features/admin/Documents_admin/pages/RequestDetailPage';
import DocumentTypesPage from '../../features/admin/Documents_admin/pages/DocumentTypesPage';
import WorkflowsPage from '../../features/admin/Documents_admin/pages/WorkflowsPage';
import ReservationCenterPage from '../../features/admin/Documents_admin/pages/ReservationCenterPage';
import ResourcesPage from '../../features/admin/Documents_admin/pages/ResourcesPage';
import TemplatesPage from '../../features/admin/Documents_admin/pages/TemplatesPage';
import SlaAutomationPage from '../../features/admin/Documents_admin/pages/SlaAutomationPage';
import DocumentsAnalyticsPage from '../../features/admin/Documents_admin/pages/DocumentsAnalyticsPage';
import DeliveryMonitoringPage from '../../features/admin/Documents_admin/pages/DeliveryMonitoringPage';
import WorkloadBoardPage from '../../features/admin/Documents_admin/pages/WorkloadBoardPage';
import ServiceCatalogPage from '../../features/admin/Documents_admin/pages/ServiceCatalogPage';
import ServiceCatalogFormPage from '../../features/admin/Documents_admin/pages/ServiceCatalogFormPage';
import TotalStudentsListPage from '../../features/admin/student/student_cards/total_students/pages/TotalStudentsListPage';
import ActiveStudentsListPage from '../../features/admin/student/student_cards/active_students/pages/ActiveStudentsListPage';
import InactiveStudentsListPage from '../../features/admin/student/student_cards/inactive_students/pages/InactiveStudentsListPage';
import WithoutInternshipListPage from '../../features/admin/student/student_cards/without_internship/pages/WithoutInternshipListPage';
import WithInternshipListPage from '../../features/admin/student/student_cards/with_internship/pages/WithInternshipListPage';
import EngagementLevelListPage from '../../features/admin/student/student_cards/engagement_level/pages/EngagementLevelListPage';
import AllEncadrantsPage from '../../features/admin/pages/AllEncadrantsPage';
import AddEncadrantPage from '../../features/admin/encadrant/pages/AddEncadrantPage';
import AllEncadrantsListPage from '../../features/admin/encadrant/encadrant_cards/all-encadrants/pages/AllEncadrantsListPage';
import EncadrantsByAssignedStudentsListPage from '../../features/admin/encadrant/encadrant_cards/assigned-students/pages/EncadrantsByAssignedStudentsListPage';
import SmartAssignmentPage from '../../features/admin/encadrant/smart-assignment/pages/SmartAssignmentPage';
import AllAdminsPage from '../../features/admin/pages/AllAdminsPage';
import DashboardStudentsPage from '../../features/admin/pages/DashboardStudentsPage';
import DashboardEncadrantsPage from '../../features/admin/pages/DashboardEncadrantsPage';
import DashboardAdminsPage from '../../features/admin/pages/DashboardAdminsPage';
import StageAdministratorsListPage from '../../features/admin/sous_Admin/pages/StageAdministratorsListPage';
import FinanceAdministratorsListPage from '../../features/admin/sous_Admin/pages/FinanceAdministratorsListPage';
import DocumentsAdministratorsListPage from '../../features/admin/sous_Admin/pages/DocumentsAdministratorsListPage';
import CommunicationAdministratorsListPage from '../../features/admin/sous_Admin/pages/CommunicationAdministratorsListPage';
import CreateAdministratorPage from '../../features/admin/sous_Admin/pages/CreateAdministratorPage';
import StudentsWithoutInternshipPage from '../../features/admin/pages/StudentsWithoutInternshipPage';
import ActiveInternshipOffersPage from '../../features/admin/pages/ActiveInternshipOffersPage';
import OngoingApplicationsPage from '../../features/admin/pages/OngoingApplicationsPage';
import DocumentsPendingValidationPage from '../../features/admin/pages/DocumentsPendingValidationPage';
import StudentsUnpaidSrfPage from '../../features/admin/pages/StudentsUnpaidSrfPage';
import MainHistoryPage from '../../features/admin/main_history/pages/MainHistoryPage';
import TotalActionsHistoryCardPage from '../../features/admin/main_history/History_card/TotalActions_card/pages/TotalActionsHistoryCardPage';
import StudentsHistoryCardPage from '../../features/admin/main_history/History_card/Students_card/pages/StudentsHistoryCardPage';
import AdminsHistoryCardPage from '../../features/admin/main_history/History_card/Admins_card/pages/AdminsHistoryCardPage';
import EncadrantsHistoryCardPage from '../../features/admin/main_history/History_card/Encadrants_card/pages/EncadrantsHistoryCardPage';
import InternshipOffersHistoryCardPage from '../../features/admin/main_history/History_card/InternshipOffers_card/pages/InternshipOffersHistoryCardPage';
import ApplicationsHistoryCardPage from '../../features/admin/main_history/History_card/Applications_card/pages/ApplicationsHistoryCardPage';
import AnnouncementsHistoryCardPage from '../../features/admin/main_history/History_card/Announcements_card/pages/AnnouncementsHistoryCardPage';
import DocumentsHistoryCardPage from '../../features/admin/main_history/History_card/Documents_card/pages/DocumentsHistoryCardPage';
import SrfHistoryCardPage from '../../features/admin/main_history/History_card/Srf_card/pages/SrfHistoryCardPage';
import ChatHistoryCardPage from '../../features/admin/main_history/History_card/Chat_card/pages/ChatHistoryCardPage';
import ReportsHistoryCardPage from '../../features/admin/main_history/History_card/Reports_card/pages/ReportsHistoryCardPage';
import TasksHistoryCardPage from '../../features/admin/main_history/History_card/Tasks_card/pages/TasksHistoryCardPage';
import MeetingsHistoryCardPage from '../../features/admin/main_history/History_card/Meetings_card/pages/MeetingsHistoryCardPage';
import AdminProfilePage from '../../features/admin/account/pages/AdminProfilePage';
import AdminSettingsPage from '../../features/admin/account/pages/AdminSettingsPage';
import AcademicStructurePage from '../../features/admin/academic-structure/pages/AcademicStructurePage';
import EmailSystemPage from '../../features/admin/email-system/pages/EmailSystemPage';
import NotificationCenterPage from '../../features/shared/notifications/pages/NotificationCenterPage';
import NotificationAnalyticsPage from '../../features/admin/notifications/pages/NotificationAnalyticsPage';

// Student Pages
import StudentDashboardPage from '../../features/student/Dashboard/pages/StudentDashboardPage';
import StudentInternshipOffersPage from '../../features/student/internship_offers/pages/StudentInternshipOffersPage';
import AllInternshipOffersPage from '../../features/student/internship_offers/pages/AllInternshipOffersPage';
import InternshipOfferDetailsPage from '../../features/student/internship_offers/pages/InternshipOfferDetailsPage';
import ApplyToInternshipPage from '../../features/student/internship_offers/pages/ApplyToInternshipPage';
import MyApplicationsPage from '../../features/student/internship_offers/pages/MyApplicationsPage';
import ApplicationDetailPage from '../../features/student/internship_offers/pages/ApplicationDetailPage';
import CvAnalysisPage from '../../features/student/internship_offers/pages/CvAnalysisPage';
import { CvAnalysisToolPage } from '../../features/student/internship_offers/CV_Analyse';
import { CvBuilderPage } from '../../features/student/internship_offers/cv_builder';
import { AiCareerCoachPage } from '../../features/student/internship_offers/AI_Career_Coach';
import { InterviewSimulatorPage } from '../../features/student/internship_offers/interview_Simulator';
import { ChatPage } from '../../features/student/internship_offers/chat';
import { HistoryPage } from '../../features/student/internship_offers/history';
import {
  AllAnnouncementsPage,
  AnnouncementsChatPage as StudentAnnouncementsChatPage,
  AnnouncementsHistoryPage as StudentAnnouncementsHistoryPage,
  AnnouncementsSavedPage as StudentAnnouncementsSavedPage,
  AnnouncementsPage as StudentAnnouncementsPage,
} from '../../features/student/Annoucements';
import ViewStudentAnnouncementPage from '../../features/student/Annoucements/pages/ViewStudentAnnouncementPage';
import { MainHistoryPage as StudentMainHistoryPage } from '../../features/student/main_history';
import {
  DocumentsChatPage as StudentDocumentsChatPage,
  DocumentsPage as StudentDocumentsPage,
} from '../../features/student/Documents';
import {
  EncadrantAgendaPage as StudentEncadrantAgendaPage,
  EncadrantChatPage as StudentEncadrantChatPage,
  EncadrantPage as StudentEncadrantPage,
  EncadrantReportPage as StudentEncadrantReportPage,
  EncadrantTaskPage as StudentEncadrantTaskPage,
  EncadrantWorkspacePage as StudentEncadrantWorkspacePage,
  EncadrantWhiteboardPage as StudentEncadrantWhiteboardPage,
} from '../../features/student/Encadrant';
import {
  ReportEditorPage as StudentReportEditorPage,
  ReportsHubPage as StudentReportsHubPage,
} from '../../features/student/reports';
import { SrfChatPage as StudentSrfChatPage, SrfPage as StudentSrfPage } from '../../features/student/SRF';

// CV Pages
import CVListPage from '../../features/cv/pages/CVListPage';
import CVEditorPage from '../../features/cv/pages/CVEditorPage';
import CVFinalizePage from '../../features/cv/pages/CVFinalizePage';
import PublicCvPage from '../../features/cv/pages/PublicCvPage';

// Hooks
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getDefaultHomePath, normalizeRole } from '../../features/auth/utils/roleAuth';

// Guards
import { GuestGuard } from './guards/GuestGuard';
import { OnboardingGuard } from './guards/OnboardingGuard';
import { AuthGuard } from './guards/AuthGuard';
import { RouteAccessGuard } from './guards/RouteAccessGuard';
import { AuthLoadingGate } from './guards/AuthLoadingGate';
import AdminAppProviders from '../../features/admin/providers/AdminAppProviders';

const DashboardRedirect = () => {
  const { user, isLoading, isAuthReady } = useAuth();

  if (!isAuthReady && isLoading) {
    return <AuthLoadingGate />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultHomePath(normalizeRole(user.role))} replace />;
};

export const router = createBrowserRouter(
[
  {
    path: '/callback',
    element: <CallbackPage />
  },
  {
    path: '/unauthorized',
    element: <AccessDeniedPage />
  },

  {
    path: '/cv/public/:token',
    element: <PublicCvPage />
  },

  {
    element: <GuestGuard />,
    children: [
      {
        path: '/login',
        element: <LoginPage />
      }
    ]
  },
  {
    element: <OnboardingGuard />,
    children: [
      {
        path: '/confirm-identity',
        element: <ConfirmIdentityPage />
      },
      {
        path: '/complete-profile',
        element: <CompleteProfilePage />
      }
    ]
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RouteAccessGuard />,
        children: [
      {
        element: <AdminAppProviders />,
        children: [
      {
        path: '/',
        element: <DashboardRedirect />
      },
      {
        path: '/student-dashboard',
        element: <StudentDashboardPage />
      },
      {
        path: '/student/profile',
        element: <AdminProfilePage variant="student" />
      },
      {
        path: '/student/announcements',
        element: <StudentAnnouncementsPage />
      },
      {
        path: '/student/announcements/all',
        element: <AllAnnouncementsPage />
      },
      {
        path: '/student/announcements/chat',
        element: <StudentAnnouncementsChatPage />
      },
      {
        path: '/student/announcements/history',
        element: <StudentAnnouncementsHistoryPage />
      },
      {
        path: '/student/announcements/saved',
        element: <StudentAnnouncementsSavedPage />
      },
      {
        path: '/student/announcements/:id',
        element: <ViewStudentAnnouncementPage />
      },
      {
        path: '/student/main-history',
        element: <StudentMainHistoryPage />
      },
      {
        path: '/student/documents',
        element: <StudentDocumentsPage />
      },
      {
        path: '/student/documents/chat',
        element: <StudentDocumentsChatPage />
      },
      {
        path: '/student/srf',
        element: <StudentSrfPage />
      },
      {
        path: '/student/srf/chat',
        element: <StudentSrfChatPage />
      },
      {
        path: '/student/encadrant',
        element: <StudentEncadrantPage />
      },
      {
        path: '/student/encadrant/chat',
        element: <StudentEncadrantChatPage />
      },
      {
        path: '/student/encadrant/agenda',
        element: <StudentEncadrantAgendaPage />
      },
      {
        path: '/student/encadrant/task',
        element: <StudentEncadrantTaskPage />
      },
      {
        path: '/student/encadrant/workspace',
        element: <StudentEncadrantWorkspacePage />
      },
      {
        path: '/student/workspace/whiteboard',
        element: <StudentEncadrantWhiteboardPage />
      },
      {
        path: '/student/encadrant/workspace/whiteboard',
        element: <StudentEncadrantWhiteboardPage />
      },
      {
        path: '/student/encadrant/report',
        element: <StudentEncadrantReportPage />
      },
      {
        path: '/student/reports',
        element: <StudentReportsHubPage />
      },
      {
        path: '/student/reports/editor',
        element: <Navigate to="/student/reports/editor/rpt-main-2026" replace />
      },
      {
        path: '/student/reports/editor/:reportId',
        element: <StudentReportEditorPage />
      },
      {
        path: '/student/internship-offers',
        element: <StudentInternshipOffersPage />
      },
      {
        path: '/student/internship-offers/all',
        element: <AllInternshipOffersPage />
      },
      {
        path: '/student/internship-offers/cv-builder',
        element: <CvBuilderPage />
      },
      {
        path: '/student/internship-offers/cv-analysis-tool',
        element: <CvAnalysisToolPage />
      },
      {
        path: '/student/internship-offers/ai-career-coach',
        element: <AiCareerCoachPage />
      },
      {
        path: '/student/internship-offers/interview-simulator',
        element: <InterviewSimulatorPage />
      },
      {
        path: '/student/internship-offers/chat',
        element: <ChatPage />
      },
      {
        path: '/student/internship-offers/history',
        element: <HistoryPage />
      },
      {
        path: '/student/internship-offers/applications',
        element: <MyApplicationsPage />
      },
      {
        path: '/student/internship-offers/applications/:appId',
        element: <ApplicationDetailPage />
      },
      {
        path: '/student/internship-offers/:offerId/apply',
        element: <ApplyToInternshipPage />
      },
      {
        path: '/student/internship-offers/:offerId/cv-analysis',
        element: <CvAnalysisPage />
      },
      {
        path: '/student/internship-offers/:offerId',
        element: <InternshipOfferDetailsPage />
      },
      {
        path: '/admin/dashboard',
        element: <AdminDashboardPage />
      },
      {
        path: '/admin-dashboard',
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: '/admin/profile',
        element: <AdminProfilePage />
      },
      {
        path: '/admin/settings',
        element: <AdminSettingsPage />
      },
      {
        path: '/admin/settings/academic-structure',
        element: <AcademicStructurePage />
      },
      {
        path: '/admin/settings/email-system',
        element: <EmailSystemPage />
      },
      {
        path: '/admin/settings/notification-analytics',
        element: <NotificationAnalyticsPage />
      },
      {
        path: '/notifications',
        element: <NotificationCenterPage />
      },
      {
        path: '/admin/notifications',
        element: <NotificationCenterPage />
      },
      {
        path: '/student/notifications',
        element: <NotificationCenterPage />
      },
      {
        path: '/admin/dashboard/students',
        element: <DashboardStudentsPage />
      },
      {
        path: '/admin/dashboard/encadrants',
        element: <DashboardEncadrantsPage />
      },
      {
        path: '/admin/dashboard/admins',
        element: <DashboardAdminsPage />
      },
      {
        path: '/admin/internship-offers',
        element: <InternshipOffersPage />
      },
      {
        path: '/admin/internship-offers/create',
        element: <CreateInternshipOfferPage />
      },
      {
        path: '/admin/internship-offers/:id/edit',
        element: <EditInternshipOfferPage />
      },
      {
        path: '/admin/internship-offers/all',
        element: <AllInternshipOffersListPage />
      },
      {
        path: '/admin/internship-offers/active',
        element: <InternshipActiveOffersListPage />
      },
      {
        path: '/admin/internship-offers/expired',
        element: <InternshipExpiredOffersListPage />
      },
      {
        path: '/admin/internship-offers/draft',
        element: <InternshipDraftOffersListPage />
      },
      {
        path: '/admin/internship-offers/closed',
        element: <InternshipClosedOffersListPage />
      },
      {
        path: '/admin/internship-offers/archived',
        element: <InternshipArchivedOffersListPage />
      },
      {
        path: '/admin/internship-offers/with-applications',
        element: <InternshipOffersWithApplicationsListPage />
      },
      {
        path: '/admin/internship-offers/chat',
        element: <InternshipOffersChatPage />
      },
      {
        path: '/admin/internship-offers/drafts',
        element: <InternshipOffersDraftsPage />
      },
      {
        path: '/admin/internship-offers/history',
        element: <InternshipOffersHistoryPage />
      },
      {
        path: '/admin/announcements',
        element: <AnnouncementsPage />
      },
      {
        path: '/admin/announcements/create',
        element: <CreateAnnouncementPage />
      },
      {
        path: '/admin/announcements/all',
        element: <AllAnnouncementsListPage />
      },
      {
        path: '/admin/announcements/active',
        element: <ActiveAnnouncementsListPage />
      },
      {
        path: '/admin/announcements/chat',
        element: <AnnouncementsChatPage />
      },
      {
        path: '/admin/announcements/history',
        element: <AnnouncementsHistoryPage />
      },
      {
        path: '/admin/announcements/types',
        element: <AnnouncementTypesPage />
      },
      {
        path: '/admin/announcements/analytics',
        element: <AnnouncementsAnalyticsPage />
      },
      {
        path: '/admin/announcements/insights',
        element: <AnnouncementsInsightsPage />
      },
      {
        path: '/admin/announcements/engagement',
        element: <AnnouncementsEngagementPage />
      },
      {
        path: '/admin/announcements/scheduled',
        element: <ScheduledAnnouncementsPage />
      },
      {
        path: '/admin/announcements/archived',
        element: <ArchivedAnnouncementsPage />
      },
      {
        path: '/admin/announcements/:id/edit',
        element: <EditAnnouncementPage />
      },
      {
        path: '/admin/announcements/:id',
        element: <ViewAnnouncementPage />
      },
      {
        path: '/admin/history',
        element: <MainHistoryPage />
      },
      {
        path: '/admin/history/total-actions',
        element: <TotalActionsHistoryCardPage />
      },
      {
        path: '/admin/history/students',
        element: <StudentsHistoryCardPage />
      },
      {
        path: '/admin/history/admins',
        element: <AdminsHistoryCardPage />
      },
      {
        path: '/admin/history/encadrants',
        element: <EncadrantsHistoryCardPage />
      },
      {
        path: '/admin/history/internship-offers',
        element: <InternshipOffersHistoryCardPage />
      },
      {
        path: '/admin/history/applications',
        element: <ApplicationsHistoryCardPage />
      },
      {
        path: '/admin/history/announcements',
        element: <AnnouncementsHistoryCardPage />
      },
      {
        path: '/admin/history/documents',
        element: <DocumentsHistoryCardPage />
      },
      {
        path: '/admin/history/srf',
        element: <SrfHistoryCardPage />
      },
      {
        path: '/admin/history/chat',
        element: <ChatHistoryCardPage />
      },
      {
        path: '/admin/history/reports',
        element: <ReportsHistoryCardPage />
      },
      {
        path: '/admin/history/tasks',
        element: <TasksHistoryCardPage />
      },
      {
        path: '/admin/history/meetings',
        element: <MeetingsHistoryCardPage />
      },
      {
        path: '/admin/documents/catalog/create',
        element: <ServiceCatalogFormPage />
      },
      {
        path: '/admin/documents/catalog/:id/edit',
        element: <ServiceCatalogFormPage />
      },
      {
        path: '/admin/documents/catalog',
        element: <ServiceCatalogPage />
      },
      {
        path: '/admin/documents/requests/:id',
        element: <RequestDetailPage />
      },
      {
        path: '/admin/documents/requests',
        element: <AllRequestsPage />
      },
      {
        path: '/admin/documents/types',
        element: <DocumentTypesPage />
      },
      {
        path: '/admin/documents/workflows',
        element: <WorkflowsPage />
      },
      {
        path: '/admin/documents/reservations',
        element: <ReservationCenterPage />
      },
      {
        path: '/admin/documents/resources',
        element: <ResourcesPage />
      },
      {
        path: '/admin/documents/templates',
        element: <TemplatesPage />
      },
      {
        path: '/admin/documents/sla',
        element: <SlaAutomationPage />
      },
      {
        path: '/admin/documents/analytics',
        element: <DocumentsAnalyticsPage />
      },
      {
        path: '/admin/documents/delivery',
        element: <DeliveryMonitoringPage />
      },
      {
        path: '/admin/documents/workload',
        element: <WorkloadBoardPage />
      },
      {
        path: '/admin/documents/:id/review',
        element: <ReviewDocumentPage />
      },
      {
        path: '/admin/documents',
        element: <DocumentsPage />
      },
      {
        path: '/admin/documents/all',
        element: <AllDocumentsListPage />
      },
      {
        path: '/admin/documents/pending',
        element: <PendingDocumentsListPage />
      },
      {
        path: '/admin/documents/validated',
        element: <ValidatedDocumentsListPage />
      },
      {
        path: '/admin/documents/rejected',
        element: <RejectedDocumentsListPage />
      },
      {
        path: '/admin/documents/chat',
        element: <DocumentsChatPage />
      },
      {
        path: '/admin/documents/history',
        element: <DocumentsHistoryPage />
      },
      {
        path: '/admin/srf/student/:accountId',
        element: <StudentFinancialDetailPage />
      },
      {
        path: '/admin/srf/validation/:paymentId',
        element: <PaymentValidationPage />
      },
      {
        path: '/admin/srf/paid-students',
        element: <PaidStudentsDetailPage />
      },
      {
        path: '/admin/srf/unpaid-students',
        element: <UnpaidStudentsDetailPage />
      },
      {
        path: '/admin/srf/partially-paid',
        element: <PartiallyPaidDetailPage />
      },
      {
        path: '/admin/srf/pending-validation',
        element: <PendingValidationDetailPage />
      },
      {
        path: '/admin/srf/late-payments',
        element: <LatePaymentsDetailPage />
      },
      {
        path: '/admin/srf/blocked-students',
        element: <BlockedStudentsDetailPage />
      },
      {
        path: '/admin/srf/exempted-students',
        element: <ExemptedStudentsDetailPage />
      },
      {
        path: '/admin/srf',
        element: <StudentFinancialStatusPage />
      },
      {
        path: '/admin/srf/chat',
        element: <SRFChatPage />
      },
      {
        path: '/admin/srf/imports',
        element: <FinancialImportCenterPage />
      },
      {
        path: '/admin/srf/config',
        element: <SrfNotificationsConfigPage />
      },
      {
        path: '/admin/srf/history',
        element: <SrfHistoryPage />
      },
      {
        path: '/admin/encadrant/chat',
        element: <EncadrantChatPage />
      },
      {
        path: '/admin/encadrant/meetings/history',
        element: <MeetingsHistoryPage />
      },
      {
        path: '/admin/encadrant/meetings',
        element: <EncadrantMeetingsPage />
      },
      {
        path: '/admin/encadrant/meetings/chat',
        element: <MeetingsChatPage />
      },
      {
        path: '/admin/encadrant/meetings/:id',
        element: <SupervisionMeetingDetailPage />
      },
      {
        path: '/admin/encadrant/reports',
        element: <EncadrantReportsPage />
      },
      {
        path: '/admin/encadrant/reports/in-progress',
        element: <ReportsInProgressListPage />
      },
      {
        path: '/admin/encadrant/reports/pending',
        element: <ReportsPendingListPage />
      },
      {
        path: '/admin/encadrant/reports/approved',
        element: <ReportsApprovedListPage />
      },
      {
        path: '/admin/encadrant/reports/overdue',
        element: <ReportsOverdueListPage />
      },
      {
        path: '/admin/encadrant/reports/critical',
        element: <ReportsCriticalListPage />
      },
      {
        path: '/admin/encadrant/reports/pending-validation',
        element: <ReportsPendingValidationListPage />
      },
      {
        path: '/admin/encadrant/reports/risk-alerts',
        element: <ReportsRiskAlertsListPage />
      },
      {
        path: '/admin/encadrant/reports/:id',
        element: <SupervisionReportDetailPage />
      },
      {
        path: '/admin/encadrant/smart-assignment/history',
        element: <SmartAssignmentHistoryPage />
      },
      {
        path: '/admin/encadrant/smart-assignment',
        element: <SmartAssignmentPage />
      },
      {
        path: '/admin/student/chat',
        element: <StudentChatPage />
      },
      {
        path: '/admin/sous-admin/chat',
        element: <SousAdminChatPage />
      },
      {
        path: '/admin/internship-offers/:id',
        element: <ViewInternshipOfferPage />
      },
      {
        path: '/admin/students/total-students',
        element: <TotalStudentsListPage />
      },
      {
        path: '/admin/students/active-students',
        element: <ActiveStudentsListPage />
      },
      {
        path: '/admin/students/inactive-students',
        element: <InactiveStudentsListPage />
      },
      {
        path: '/admin/students/without-internship',
        element: <WithoutInternshipListPage />
      },
      {
        path: '/admin/students/with-internship',
        element: <WithInternshipListPage />
      },
      {
        path: '/admin/students/engagement-level',
        element: <EngagementLevelListPage />
      },
      {
        path: '/admin/students/create',
        element: <CreateStudentPage />
      },
      {
        path: '/admin/students/:id/edit',
        element: <EditStudentPage />
      },
      {
        path: '/admin/students',
        element: <AllStudentsPage />
      },
      {
        path: '/admin/encadrants/history',
        element: <EncadrantsHistoryPage />
      },
      {
        path: '/admin/encadrants',
        element: <AllEncadrantsPage />
      },
      {
        path: '/admin/encadrants/smart-assignment',
        element: <Navigate to="/admin/encadrant/smart-assignment" replace />
      },
      {
        path: '/admin/encadrants/new',
        element: <AddEncadrantPage />
      },
      {
        path: '/admin/encadrants/:id/edit',
        element: <EditEncadrantPage />
      },
      {
        path: '/admin/encadrants/all',
        element: <AllEncadrantsListPage />
      },
      {
        path: '/admin/encadrants/assigned-students',
        element: <EncadrantsByAssignedStudentsListPage />
      },
      {
        path: '/admin/encadrants/reports-in-progress',
        element: <Navigate to="/admin/encadrant/reports/in-progress" replace />
      },
      {
        path: '/admin/encadrants/upcoming-meetings',
        element: <Navigate to="/admin/encadrant/meetings" replace />
      },
      {
        path: '/admin/admins/stage-administrators',
        element: <StageAdministratorsListPage />
      },
      {
        path: '/admin/admins/finance-administrators',
        element: <FinanceAdministratorsListPage />
      },
      {
        path: '/admin/admins/documents-administrators',
        element: <DocumentsAdministratorsListPage />
      },
      {
        path: '/admin/admins/communication-administrators',
        element: <CommunicationAdministratorsListPage />
      },
      {
        path: '/admin/admins/create',
        element: <Navigate to="/admin/admins/create-administrator" replace />
      },
      {
        path: '/admin/admins/create-administrator',
        element: <CreateAdministratorPage />
      },
      {
        path: '/admin/admins/:id/edit',
        element: <EditAdministratorPage />
      },
      {
        path: '/admin/admins/:id/permissions',
        element: <AssignAdminPermissionsPage />
      },
      {
        path: '/admin/admins',
        element: <AllAdminsPage />
      },
      {
        path: '/admin/students-without-internship',
        element: <StudentsWithoutInternshipPage />
      },
      {
        path: '/admin/active-internship-offers',
        element: <ActiveInternshipOffersPage />
      },
      {
        path: '/admin/ongoing-applications',
        element: <OngoingApplicationsPage />
      },
      {
        path: '/admin/documents-pending-validation',
        element: <DocumentsPendingValidationPage />
      },
      {
        path: '/admin/students-unpaid-srf',
        element: <StudentsUnpaidSrfPage />
      },
      {
        path: '/cv',
        element: <CVListPage />
      },
      {
        path: '/cv/:id/edit',
        element: <CVEditorPage />
      },
      {
        path: '/cv/:id/finalize',
        element: <CVFinalizePage />
      },
      {
        path: '/cv-editor',
        element: <CVEditorPage />
      },
      {
        path: '*',
        element: <Navigate to="/student-dashboard" replace />
      }
        ]
      }
        ]
      }
    ]
  }
],
{
  future: {
    v7_startTransition: true,
  },
});
