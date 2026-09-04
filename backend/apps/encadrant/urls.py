from django.urls import path

from .views_chat import SupervisionChatOpenView
from .views_meeting_sessions import (
    CollaborationContextView,
    MeetingSessionCreateView,
    MeetingSessionDetailView,
    MeetingSessionEndView,
    MeetingSessionJoinView,
    ScheduledMeetingsView,
)
from .views_reports import (
    EncadrantReportAttachmentView,
    EncadrantReportDetailView,
    EncadrantReportSubmitView,
    EncadrantReportsListCreateView,
    EncadrantReportTemplatesView,
)
from .views_workspace_documents import (
    WorkspaceDocumentDetailView,
    WorkspaceDocumentListCreateView,
    WorkspaceDocumentReviewView,
    WorkspaceDocumentViewedView,
)

urlpatterns = [
    path('chat/open', SupervisionChatOpenView.as_view(), name='supervision-chat-open'),
    path('collaboration/context', CollaborationContextView.as_view(), name='collaboration-context'),
    path('meeting-sessions', MeetingSessionCreateView.as_view(), name='meeting-session-create'),
    path('meeting-sessions/scheduled', ScheduledMeetingsView.as_view(), name='meeting-session-scheduled'),
    path('meeting-sessions/<uuid:session_uuid>', MeetingSessionDetailView.as_view(), name='meeting-session-detail'),
    path('meeting-sessions/<uuid:session_uuid>/join', MeetingSessionJoinView.as_view(), name='meeting-session-join'),
    path('meeting-sessions/<uuid:session_uuid>/end', MeetingSessionEndView.as_view(), name='meeting-session-end'),
    path('reports', EncadrantReportsListCreateView.as_view(), name='encadrant-reports'),
    path('reports/templates', EncadrantReportTemplatesView.as_view(), name='encadrant-report-templates'),
    path('reports/<int:report_id>', EncadrantReportDetailView.as_view(), name='encadrant-report-detail'),
    path('reports/<int:report_id>/submit', EncadrantReportSubmitView.as_view(), name='encadrant-report-submit'),
    path(
        'reports/<int:report_id>/attachments',
        EncadrantReportAttachmentView.as_view(),
        name='encadrant-report-attachments',
    ),
    path(
        'workspace/documents',
        WorkspaceDocumentListCreateView.as_view(),
        name='workspace-documents',
    ),
    path(
        'workspace/documents/<int:document_id>',
        WorkspaceDocumentDetailView.as_view(),
        name='workspace-document-detail',
    ),
    path(
        'workspace/documents/<int:document_id>/review',
        WorkspaceDocumentReviewView.as_view(),
        name='workspace-document-review',
    ),
    path(
        'workspace/documents/<int:document_id>/viewed',
        WorkspaceDocumentViewedView.as_view(),
        name='workspace-document-viewed',
    ),
]
