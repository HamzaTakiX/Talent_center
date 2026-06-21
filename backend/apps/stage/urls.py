from django.urls import path

from . import views
from . import views_extended as ext
from . import views_student as student_views

urlpatterns = [
    path('internship-offers/dashboard', views.OfferDashboardView.as_view(), name='stage-dashboard'),
    path('internship-offers/journey', student_views.StudentJourneyDashboardView.as_view(), name='stage-student-journey'),
    path('internship-offers/my-applications', student_views.StudentMyApplicationsView.as_view(), name='stage-student-applications'),
    path('internship-offers/feed', student_views.StudentOffersFeedView.as_view(), name='stage-student-feed'),
    path('internship-applications/<uuid:app_uuid>/detail', student_views.StudentApplicationDetailView.as_view(), name='stage-student-application-detail'),
    path('internship-offers', views.OfferListCreateView.as_view(), name='stage-offer-list'),
    path('internship-offers/import', views.OfferImportView.as_view(), name='stage-import'),
    path('internship-offers/import/<uuid:job_uuid>', views.OfferImportDetailView.as_view(), name='stage-import-detail'),
    path(
        'internship-offers/import/<uuid:job_uuid>/<str:action>',
        views.OfferImportDetailView.as_view(),
        name='stage-import-action',
    ),
    path('internship-offers/matches', views.StudentMatchesView.as_view(), name='stage-student-matches'),
    path('internship-offers/recommendations', ext.RecommendationFeedView.as_view(), name='stage-recommendations'),
    path('internship-offers/pipeline', ext.PipelineBoardView.as_view(), name='stage-pipeline'),
    path('internship-companies', ext.CompanyListCreateView.as_view(), name='stage-company-list'),
    path('internship-companies/<uuid:uuid>', ext.CompanyDetailView.as_view(), name='stage-company-detail'),
    path('internship-companies/<uuid:uuid>/<str:action>', ext.CompanyActionView.as_view(), name='stage-company-action'),
    path('internship-collections', ext.CollectionListCreateView.as_view(), name='stage-collection-list'),
    path('internship-collections/<int:collection_id>', ext.CollectionDetailView.as_view(), name='stage-collection-detail'),
    path(
        'internship-collections/<int:collection_id>/<str:action>',
        ext.CollectionDetailView.as_view(),
        name='stage-collection-action',
    ),
    path('internship-webhooks', ext.WebhookSubscriptionView.as_view(), name='stage-webhooks'),
    path('internship-offers/<uuid:uuid>/match', student_views.StudentOfferMatchView.as_view(), name='stage-student-offer-match'),
    path('internship-offers/<uuid:uuid>/readiness', student_views.StudentApplicationReadinessView.as_view(), name='stage-student-readiness'),
    path('internship-offers/<uuid:uuid>', views.OfferDetailView.as_view(), name='stage-offer-detail'),
    path('internship-offers/<uuid:uuid>/versions', ext.OfferVersionListView.as_view(), name='stage-offer-versions'),
    path('internship-offers/<uuid:uuid>/chat', ext.OfferChatView.as_view(), name='stage-offer-chat'),
    path(
        'internship-offers/<uuid:uuid>/applications',
        views.OfferApplicationListView.as_view(),
        name='stage-offer-applications',
    ),
    path(
        'internship-offers/<uuid:uuid>/matches',
        views.OfferMatchesView.as_view(),
        name='stage-offer-matches',
    ),
    path(
        'internship-offers/<uuid:uuid>/<str:action>',
        views.OfferActionView.as_view(),
        name='stage-offer-action',
    ),
    path(
        'internship-applications/<uuid:app_uuid>/interviews',
        ext.InterviewListView.as_view(),
        name='stage-application-interviews',
    ),
    path(
        'internship-applications/<uuid:app_uuid>/<str:action>',
        views.ApplicationActionView.as_view(),
        name='stage-application-action',
    ),
    path(
        'internship-interviews/<uuid:interview_uuid>/<str:action>',
        ext.InterviewActionView.as_view(),
        name='stage-interview-action',
    ),
]
