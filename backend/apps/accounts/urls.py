from django.urls import path
from .views import (
    LoginApiView, MeApiView, 
    ConfirmIdentityApiView, CompleteProfileApiView
)

urlpatterns = [
    path('auth/login/', LoginApiView.as_view(), name='auth-login'),
    path('auth/me/', MeApiView.as_view(), name='auth-me'),
    path('auth/confirm-identity/', ConfirmIdentityApiView.as_view(), name='auth-confirm-identity'),
    path('auth/complete-profile/', CompleteProfileApiView.as_view(), name='auth-complete-profile'),
]
