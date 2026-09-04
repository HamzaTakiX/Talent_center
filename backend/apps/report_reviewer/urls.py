from django.urls import path

from .views import AnalyzePageView

app_name = 'report_reviewer'

urlpatterns = [
    path('analyze-page/', AnalyzePageView.as_view(), name='analyze-page'),
]
