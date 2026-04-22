
from dataclasses import dataclass
from datetime import datetime, timezone

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken


@dataclass
class TokenPair:
    access: str
    refresh: str
    access_jti: str
    refresh_jti: str
    access_expires_at: datetime
    refresh_expires_at: datetime


def issue_token_pair(user) -> TokenPair:
    """Mint a refresh+access pair for the given user."""
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    return TokenPair(
        access=str(access),
        refresh=str(refresh),
        access_jti=access['jti'],
        refresh_jti=refresh['jti'],
        access_expires_at=datetime.fromtimestamp(access['exp'], tz=timezone.utc),
        refresh_expires_at=datetime.fromtimestamp(refresh['exp'], tz=timezone.utc),
    )


def decode_refresh(raw: str) -> RefreshToken:
    """Parse & verify a refresh token. Raises TokenError on failure."""
    return RefreshToken(raw)


__all__ = ['TokenPair', 'TokenError', 'issue_token_pair', 'decode_refresh']
