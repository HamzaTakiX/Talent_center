from django.urls import path

from . import views

app_name = 'cv_builder'

urlpatterns = [
    # Templates
    path('templates/', views.CvTemplateListView.as_view(), name='template-list'),
    path('templates/<int:pk>/', views.CvTemplateDetailView.as_view(), name='template-detail'),

    # Student CVs
    path('student-cvs/', views.StudentCvListCreateView.as_view(), name='studentcv-list-create'),
    path('student-cvs/<int:pk>/', views.StudentCvDetailView.as_view(), name='studentcv-detail'),
    path('student-cvs/<int:pk>/make-primary/', views.CvMakePrimaryView.as_view(), name='studentcv-make-primary'),
    path('student-cvs/<int:pk>/switch-template/', views.CvSwitchTemplateView.as_view(), name='studentcv-switch-template'),

    # Sections
    path('student-cvs/<int:pk>/sections/', views.CvSectionCreateView.as_view(), name='studentcv-add-section'),
    path('student-cvs/<int:pk>/reorder-sections/', views.CvReorderSectionsView.as_view(), name='studentcv-reorder-sections'),
    path('sections/<int:pk>/', views.CvSectionDetailView.as_view(), name='section-detail'),

    # Assets
    path('student-cvs/<int:pk>/assets/', views.CvAssetUploadView.as_view(), name='studentcv-upload-asset'),
    path('assets/<int:pk>/', views.CvAssetDetailView.as_view(), name='asset-detail'),

    # Versions
    path('student-cvs/<int:pk>/versions/', views.CvVersionListView.as_view(), name='studentcv-versions'),
    path('student-cvs/<int:pk>/save-version/', views.CvSaveVersionView.as_view(), name='studentcv-save-version'),
    path('student-cvs/<int:cv_id>/restore-version/<int:version_id>/',
         views.CvRestoreVersionView.as_view(), name='studentcv-restore-version'),

    # AI analysis
    path('student-cvs/<int:pk>/analyze/', views.CvAnalyzeView.as_view(), name='studentcv-analyze'),
    path('student-cvs/<int:pk>/analysis-history/',
         views.CvAnalysisHistoryView.as_view(), name='studentcv-analysis-history'),

    # Export
    path('student-cvs/<int:pk>/export-pdf/', views.CvExportPdfView.as_view(), name='studentcv-export-pdf'),

    # Share links
    path('student-cvs/<int:pk>/share-links/',
         views.CvShareLinkListCreateView.as_view(), name='studentcv-sharelinks'),
    path('share-links/<int:pk>/',
         views.CvShareLinkDetailView.as_view(), name='sharelink-detail'),
    path('public/<str:token>/',
         views.PublicCvView.as_view(), name='public-cv'),
]
