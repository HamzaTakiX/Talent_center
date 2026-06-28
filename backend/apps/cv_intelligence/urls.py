from django.urls import path

from . import views

app_name = 'cv_intelligence'

urlpatterns = [
    path('config/', views.CvIntelligenceConfigView.as_view(), name='config'),
    path('analyze/', views.CvIntelligenceAnalyzeView.as_view(), name='analyze'),
    path('dashboard/', views.CvIntelligenceDashboardView.as_view(), name='dashboard'),
    path(
        'internship-matches/',
        views.CvIntelligenceInternshipMatchesView.as_view(),
        name='internship-matches',
    ),
    path('cv-hash/', views.CvIntelligenceCvHashView.as_view(), name='cv-hash'),
    path('reports/', views.CvIntelligenceReportListView.as_view(), name='report-list'),
    path('reports/<uuid:report_uuid>/', views.CvIntelligenceReportDetailView.as_view(), name='report-detail'),
    path(
        'reports/<uuid:report_uuid>/compare/<uuid:previous_uuid>/',
        views.CvIntelligenceCompareView.as_view(),
        name='report-compare',
    ),
    path(
        'offers/<uuid:offer_uuid>/comparison/',
        views.CvIntelligenceOfferComparisonView.as_view(),
        name='offer-comparison',
    ),
    path(
        'offers/<uuid:offer_uuid>/interview/start/',
        views.CvIntelligenceOfferInterviewStartView.as_view(),
        name='offer-interview-start',
    ),
    path(
        'offers/<uuid:offer_uuid>/interview/evaluate/',
        views.CvIntelligenceOfferInterviewEvaluateView.as_view(),
        name='offer-interview-evaluate',
    ),
    path(
        'interviews/sessions/start/',
        views.InterviewSessionStartView.as_view(),
        name='interview-session-start',
    ),
    path(
        'interviews/sessions/',
        views.InterviewSessionListView.as_view(),
        name='interview-session-list',
    ),
    path(
        'interviews/sessions/hub-stats/',
        views.InterviewSessionHubStatsView.as_view(),
        name='interview-session-hub-stats',
    ),
    path(
        'interviews/sessions/<uuid:session_uuid>/',
        views.InterviewSessionDetailView.as_view(),
        name='interview-session-detail',
    ),
    path(
        'interviews/sessions/<uuid:session_uuid>/answer/',
        views.InterviewSessionAnswerView.as_view(),
        name='interview-session-answer',
    ),
    path(
        'interviews/sessions/<uuid:session_uuid>/complete/',
        views.InterviewSessionCompleteView.as_view(),
        name='interview-session-complete',
    ),
    path(
        'interviews/stt/transcribe/',
        views.InterviewAudioTranscribeView.as_view(),
        name='interview-audio-transcribe',
    ),
]
