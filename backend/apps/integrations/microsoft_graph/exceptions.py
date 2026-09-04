"""Microsoft Graph integration exceptions."""


class MicrosoftGraphError(Exception):
    """Base error for Microsoft Graph operations."""

    def __init__(self, message: str, *, status_code: int | None = None, details: dict | None = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class MicrosoftGraphConfigError(MicrosoftGraphError):
    """Missing or invalid Graph configuration."""


class MicrosoftGraphUnauthorized(MicrosoftGraphError):
    """Graph returned 401."""


class MicrosoftGraphForbidden(MicrosoftGraphError):
    """Graph returned 403."""


class MicrosoftGraphNotFound(MicrosoftGraphError):
    """Graph returned 404 for a resource."""


class MicrosoftUserNotFound(MicrosoftGraphError):
    """No Entra user matches the Talent Center email/UPN."""
