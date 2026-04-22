from django.urls import path

from . import views

app_name = 'profile_intelligence'

urlpatterns = [
    path('search/', views.search, name='search'),
    path('analyze/<int:student_id>/', views.analyze, name='analyze'),
    path('<int:student_id>/dashboard/', views.dashboard, name='dashboard'),
    path(
        'suggestions/<int:suggestion_id>/complete/',
        views.complete_suggestion,
        name='complete-suggestion',
    ),
]
