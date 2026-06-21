from django.urls import path, include

urlpatterns = [
    path('', include('apps.notifications.api.urls')),
]

admin_urlpatterns = [
    path('', include('apps.notifications.api.admin_urls')),
]
