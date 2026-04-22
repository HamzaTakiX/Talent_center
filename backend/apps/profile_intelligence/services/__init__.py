"""
Service layer for Student Profile Intelligence.

Every cross-app interaction — tracking a login, recomputing indicators,
generating a suggestion — goes through this package. Views and signals
should never write to models directly; they call a service function here.
This keeps business logic testable and keeps the data layer consistent
regardless of which entry point (API, signal, cron) triggered it.
"""

from . import (
    activity_tracking_service,
    behavior_analysis_service,
    profile_intelligence_engine,
    risk_detection_service,
    state_machine_service,
    suggestion_engine,
)

__all__ = [
    'activity_tracking_service',
    'behavior_analysis_service',
    'profile_intelligence_engine',
    'risk_detection_service',
    'state_machine_service',
    'suggestion_engine',
]
