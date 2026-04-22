
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .exceptions import ProviderNotImplemented
from .providers.registry import get_provider, list_all, list_enabled
from .selectors import get_active_sessions
from .serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    LoginSessionSerializer,
    MeSerializer,
    RefreshSerializer,
    ResetPasswordSerializer,
)
from .services.auth import (
    perform_login,
    perform_logout,
    perform_logout_all,
    refresh_session,
)
from .services.passwords import change_password, request_password_reset, reset_password
from .services.sessions import revoke_session
from .utils import envelope


def _user_payload(user) -> dict:
    return MeSerializer(user).data


def _session_payload(session) -> dict:
    return {
        'id': session.id,
        'expires_at': session.expires_at,
    }


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, tokens, session = perform_login(
            provider_name='LOCAL',
            credentials={
                'email': serializer.validated_data['email'],
                'password': serializer.validated_data['password'],
            },
            request=request,
            device_name=serializer.validated_data.get('device_name', ''),
        )

        return Response(
            envelope(True, 'Login successful', data={
                'access': tokens.access,
                'refresh': tokens.refresh,
                'user': _user_payload(user),
                'session': _session_payload(session),
            }),
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session = getattr(request.user, '_auth_session', None)
        perform_logout(user=request.user, session=session, request=request)
        return Response(
            envelope(True, 'Logged out', data={}),
            status=status.HTTP_200_OK,
        )


class LogoutAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        count = perform_logout_all(user=request.user, request=request)
        return Response(
            envelope(True, 'All sessions revoked', data={'revoked_count': count}),
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            envelope(True, 'OK', data=_user_payload(request.user)),
            status=status.HTTP_200_OK,
        )


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, tokens, session = refresh_session(
            raw_refresh=serializer.validated_data['refresh'],
            request=request,
        )
        return Response(
            envelope(True, 'Token refreshed', data={
                'access': tokens.access,
                'refresh': tokens.refresh,
                'user': _user_payload(user),
                'session': _session_payload(session),
            }),
            status=status.HTTP_200_OK,
        )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_password_reset(email=serializer.validated_data['email'], request=request)
        # Always 200 to avoid enumeration.
        return Response(
            envelope(True, 'If an account exists, a reset link was sent.', data={}),
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_password(
            token=serializer.validated_data['token'],
            new_password=serializer.validated_data['new_password'],
            request=request,
        )
        return Response(
            envelope(True, 'Password has been reset', data={}),
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        current_session = getattr(request.user, '_auth_session', None)
        change_password(
            user=request.user,
            old_password=serializer.validated_data['old_password'],
            new_password=serializer.validated_data['new_password'],
            logout_other_sessions=serializer.validated_data.get('logout_other_sessions', False),
            current_jti=getattr(current_session, 'jti', None),
            request=request,
        )
        return Response(
            envelope(True, 'Password changed', data={}),
            status=status.HTTP_200_OK,
        )


class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = get_active_sessions(request.user)
        current_jti = getattr(getattr(request.user, '_auth_session', None), 'jti', None)
        data = LoginSessionSerializer(
            sessions, many=True, context={'current_jti': current_jti},
        ).data
        return Response(
            envelope(True, 'OK', data=data),
            status=status.HTTP_200_OK,
        )


class SessionRevokeView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id: int):
        revoke_session(request.user, session_id)
        return Response(
            envelope(True, 'Session revoked', data={'id': session_id}),
            status=status.HTTP_200_OK,
        )


class ProviderListView(APIView):
    """Public — frontend login page reads this to decide which buttons to render."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            envelope(True, 'OK', data={'enabled': list_enabled(), 'all': list_all()}),
            status=status.HTTP_200_OK,
        )


class ProviderBeginView(APIView):
    """Kicks off a provider's redirect flow. Returns 501 while stubbed."""

    permission_classes = [AllowAny]

    def get(self, request, provider: str):
        instance = get_provider(provider)  # raises if disabled / unknown
        try:
            redirect_url = instance.begin_login(request)
        except NotImplementedError:
            raise ProviderNotImplemented(
                f'{instance.name.value} is registered but not yet implemented.'
            )
        return Response(
            envelope(True, 'Redirect to provider', data={'redirect_url': redirect_url}),
            status=status.HTTP_200_OK,
        )


class ProviderCallbackView(APIView):
    """Completes a provider's redirect flow. Returns 501 while stubbed."""

    permission_classes = [AllowAny]

    def get(self, request, provider: str):
        return self._handle(request, provider)

    def post(self, request, provider: str):
        return self._handle(request, provider)

    def _handle(self, request, provider: str):
        instance = get_provider(provider)
        try:
            identity = instance.handle_callback(request)
        except NotImplementedError:
            raise ProviderNotImplemented(
                f'{instance.name.value} is registered but not yet implemented.'
            )

        # Once a real provider is wired, feed the identity through the same
        # pipeline perform_login uses. We intentionally do NOT call that here
        # until providers are implemented, to keep the stubs obvious.
        from .services.users import resolve_or_link_user
        from .tokens import issue_token_pair
        from .services.sessions import create_session
        from .services.security import log_event

        user = resolve_or_link_user(identity)
        tokens = issue_token_pair(user)
        session = create_session(
            user=user,
            jti=tokens.access_jti,
            expires_at=tokens.access_expires_at,
            request=request,
        )
        log_event(
            event_type='LOGIN_SUCCESS',
            user=user,
            metadata={'provider': instance.name.value, 'session_id': session.id},
        )
        return Response(
            envelope(True, 'Login successful', data={
                'access': tokens.access,
                'refresh': tokens.refresh,
                'user': _user_payload(user),
                'session': _session_payload(session),
            }),
            status=status.HTTP_200_OK,
        )
