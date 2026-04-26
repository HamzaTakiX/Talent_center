from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/', include('apps.accounts_et_roles.urls')),
    path('api/cv/', include('apps.cv_builder.urls')),
    path('api/profile-intelligence/', include('apps.profile_intelligence.urls')),
]

# Serve user-uploaded files in DEBUG mode. In production, use Nginx or a CDN.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
