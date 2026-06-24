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
]
