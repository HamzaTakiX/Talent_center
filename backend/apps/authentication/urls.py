from django.urls import path

from .views import (
    ChangePasswordView,
    ForgotPasswordView,
    LoginView,
    LogoutAllView,
    LogoutView,
    MeView,
    ProviderBeginView,
    ProviderCallbackView,
    ProviderListView,
    RefreshView,
    ResetPasswordView,
    SessionListView,
    SessionRevokeView,
)

urlpatterns = [
    path('login', LoginView.as_view(), name='auth-login'),
    path('logout', LogoutView.as_view(), name='auth-logout'),
    path('logout-all', LogoutAllView.as_view(), name='auth-logout-all'),
    path('me', MeView.as_view(), name='auth-me'),
    path('refresh', RefreshView.as_view(), name='auth-refresh'),

    path('forgot-password', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('reset-password', ResetPasswordView.as_view(), name='auth-reset-password'),
    path('change-password', ChangePasswordView.as_view(), name='auth-change-password'),

    path('sessions', SessionListView.as_view(), name='auth-sessions-list'),
    path('sessions/<int:session_id>', SessionRevokeView.as_view(), name='auth-sessions-revoke'),

    path('providers', ProviderListView.as_view(), name='auth-providers'),
    path('providers/<str:provider>/begin', ProviderBeginView.as_view(), name='auth-provider-begin'),
    path('providers/<str:provider>/callback', ProviderCallbackView.as_view(), name='auth-provider-callback'),
]
