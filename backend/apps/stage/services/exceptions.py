"""Domain exceptions for the internship offers module."""

from __future__ import annotations


class StageServiceError(Exception):
    """Base exception for stage module business logic."""

    def __init__(self, message: str, code: str = 'stage_error'):
        self.message = message
        self.code = code
        super().__init__(message)


class OfferValidationError(StageServiceError):
    def __init__(self, message: str, field: str = ''):
        self.field = field
        super().__init__(message, code='offer_validation_error')


class OfferTransitionError(StageServiceError):
    def __init__(self, message: str, from_status: str = '', to_status: str = ''):
        self.from_status = from_status
        self.to_status = to_status
        super().__init__(message, code='offer_transition_error')


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
        super().__init__(message, code='duplicate_offer')


class ImportJobError(StageServiceError):
    def __init__(self, message: str, job_id: int | None = None):
        self.job_id = job_id
        super().__init__(message, code='import_job_error')
