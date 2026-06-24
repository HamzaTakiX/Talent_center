from django.urls import path

from . import views

app_name = 'career_coach'

urlpatterns = [
    path('config/', views.CareerCoachConfigView.as_view(), name='config'),
    path('context/', views.CareerCoachContextView.as_view(), name='context'),
    path('sessions/', views.CareerCoachSessionsView.as_view(), name='sessions'),
    path('sessions/<uuid:session_id>/', views.CareerCoachSessionDetailView.as_view(), name='session-detail'),
    path('sessions/<uuid:session_id>/summary/', views.CareerCoachSessionSummaryView.as_view(), name='session-summary'),
    path('chat/', views.CareerCoachChatView.as_view(), name='chat'),
]
