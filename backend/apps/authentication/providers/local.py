"""Local email/password provider — fully implemented."""

from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed

from .base import AuthProvider, ProviderIdentity, ProviderName
from .registry import register


@register
class LocalProvider(AuthProvider):
    name = ProviderName.LOCAL

    def authenticate(self, credentials: dict, request) -> ProviderIdentity:
        email = (credentials.get('email') or '').strip().lower()
        password = credentials.get('password') or ''
        if not email or not password:
            raise AuthenticationFailed('Invalid credentials')

        user = authenticate(request=request, email=email, password=password)
        if user is None:
            raise AuthenticationFailed('Invalid credentials')

        return ProviderIdentity(
            provider=ProviderName.LOCAL,
            provider_user_id='',
            email=user.email,
            email_verified=True,
            raw_claims={},
        )
