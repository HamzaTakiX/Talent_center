
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import LoginSession


class SessionAwareJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)

        jti = validated_token.get('jti')
        if not jti:
            raise AuthenticationFailed('Token is missing jti claim.')

        session = LoginSession.objects.filter(jti=jti).first()
        if session is None:
            raise AuthenticationFailed('Session not found.')
        if session.revoked_at is not None:
            raise AuthenticationFailed('Session has been revoked.')
        if session.expires_at <= timezone.now():
            raise AuthenticationFailed('Session has expired.')

        # Attach for downstream views that may want the caller's session row.
        user._auth_session = session
        return user
