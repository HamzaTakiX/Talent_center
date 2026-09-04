"""Domain exceptions for the internship offers module."""

from __future__ import annotations


class StageServiceError(Exception):
    """Base exception for stage module business logic.

    `details` carries machine-readable context (missing field codes, conflicting
    offer ids, …) so the API can localize a message instead of echoing raw
    English service text at the operator.
    """

    def __init__(self, message: str, code: str = 'stage_error', details: dict | None = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)


class OfferValidationError(StageServiceError):
    def __init__(self, message: str, field: str = '', details: dict | None = None):
        self.field = field
        super().__init__(message, code='offer_validation_error', details=details)


class OfferTransitionError(StageServiceError):
    def __init__(self, message: str, from_status: str = '', to_status: str = ''):
        self.from_status = from_status
        self.to_status = to_status
        super().__init__(
            message,
            code='offer_transition_error',
            details={'from_status': from_status, 'to_status': to_status},
        )


class ApplicationTransitionError(StageServiceError):
    def __init__(self, message: str, from_status: str = '', to_status: str = ''):
        self.from_status = from_status
        self.to_status = to_status
        super().__init__(message, code='application_transition_error')


class OfferPermissionError(StageServiceError):
    def __init__(self, message: str = 'Permission denied'):
        super().__init__(message, code='offer_permission_error')


class DuplicateOfferError(StageServiceError):
    def __init__(self, message: str, existing_offer_id: int | None = None):
        self.existing_offer_id = existing_offer_id
        super().__init__(
            message,
            code='duplicate_offer',
            details={'existing_offer_id': existing_offer_id},
        )


class ImportJobError(StageServiceError):
    def __init__(self, message: str, job_id: int | None = None):
        self.job_id = job_id
        super().__init__(message, code='import_job_error')
