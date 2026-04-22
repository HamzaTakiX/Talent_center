from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/', include('apps.accounts_et_roles.urls')),
    path('api/cv/', include('apps.cv_builder.urls')),
    path('api/profile-intelligence/', include('apps.profile_intelligence.urls')),
]
