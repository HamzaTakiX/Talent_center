
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler as drf_default_handler

from .utils import envelope


class AccountLocked(APIException):
    status_code = status.HTTP_423_LOCKED
    default_detail = 'Account temporarily locked.'
    default_code = 'account_locked'


class ProviderNotEnabled(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Authentication provider is not enabled.'
    default_code = 'provider_not_enabled'


class ProviderNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Authentication provider not found.'
    default_code = 'provider_not_found'


class ProviderNotImplemented(APIException):
    status_code = status.HTTP_501_NOT_IMPLEMENTED
    default_detail = 'Provider not implemented.'
    default_code = 'provider_not_implemented'


_MESSAGE_BY_STATUS = {
    400: 'Validation failed',
    401: 'Authentication required',
    403: 'Permission denied',
    404: 'Not found',
    405: 'Method not allowed',
    423: 'Account temporarily locked',
    429: 'Too many requests',
    500: 'Internal server error',
    501: 'Not implemented',
}


# Status codes where the canonical message always wins over the exception's
# detail (the detail is preserved inside `errors`). Validation and auth errors
# keep their specific detail string as the user-facing message.
_CANONICAL_MESSAGE_STATUSES = {423, 429, 501, 500, 405}


def _top_message(detail, status_code: int) -> str:
    if status_code in _CANONICAL_MESSAGE_STATUSES:
        return _MESSAGE_BY_STATUS.get(status_code, 'Request failed')
    if isinstance(detail, dict):
        msg = detail.get('detail') or detail.get('message')
        if isinstance(msg, str):
            return msg
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list) and detail and isinstance(detail[0], str):
        return detail[0]
    return _MESSAGE_BY_STATUS.get(status_code, 'Request failed')


def _coerce_errors(detail) -> dict:
    """Normalize DRF `detail` into an object of `field -> [messages]`."""
    if isinstance(detail, dict):
        out: dict = {}
        for key, value in detail.items():
            if isinstance(value, list):
                out[key] = [str(v) for v in value]
            elif isinstance(value, dict):
                out[key] = value
            else:
                out[key] = [str(value)]
        return out
    if isinstance(detail, list):
        return {'non_field_errors': [str(v) for v in detail]}
    return {'detail': [str(detail)]}


def custom_exception_handler(exc, context):
    response = drf_default_handler(exc, context)
    if response is None:
        return None

    detail = response.data
    message = _top_message(detail, response.status_code)
    errors = _coerce_errors(detail)

    response.data = envelope(success=False, message=message, errors=errors)
    return response
