from django.urls import path

from .views import CompleteProfileApiView, ConfirmIdentityApiView, UpdateInternshipStatusApiView

urlpatterns = [
    path('accounts/confirm-identity', ConfirmIdentityApiView.as_view(), name='accounts-confirm-identity'),
    path('accounts/complete-profile', CompleteProfileApiView.as_view(), name='accounts-complete-profile'),
    path('accounts/internship-status', UpdateInternshipStatusApiView.as_view(), name='accounts-internship-status'),
]
