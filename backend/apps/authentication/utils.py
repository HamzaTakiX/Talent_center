
import hashlib
from typing import Any, Optional


def envelope(
    success: bool,
    message: str,
    data: Optional[Any] = None,
    errors: Optional[dict] = None,
) -> dict:
    """Consistent JSON response shape.

    Success:  {success: true,  message, data}
    Failure:  {success: false, message, errors}
    """
    if success:
        return {'success': True, 'message': message, 'data': data}
    return {'success': False, 'message': message, 'errors': errors or {}}


def get_client_ip(request) -> Optional[str]:
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def get_user_agent(request) -> str:
    return (request.META.get('HTTP_USER_AGENT') or '')[:1024]


def hash_token(raw: str) -> str:
    """SHA-256 hex digest, used to store password-reset tokens at rest."""
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()
