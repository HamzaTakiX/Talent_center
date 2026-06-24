"""Performance timing for AI Career Coach operations."""

from __future__ import annotations

import logging
import time
from contextlib import contextmanager
from typing import Any

logger = logging.getLogger(__name__)


class PerfTracker:
    """Collect per-step timings (milliseconds) for a single request."""

    def __init__(self, operation: str) -> None:
        self.operation = operation
        self.timings: dict[str, float] = {}

    @contextmanager
    def track(self, step: str):
        start = time.perf_counter()
        try:
            yield
        finally:
            elapsed_ms = (time.perf_counter() - start) * 1000
            self.timings[step] = round(elapsed_ms, 2)
            logger.info(
                'career_coach_perf operation=%s step=%s ms=%.2f',
                self.operation,
                step,
                elapsed_ms,
            )

    def as_dict(self) -> dict[str, Any]:
        total = round(sum(self.timings.values()), 2)
        return {'operation': self.operation, 'steps_ms': self.timings, 'total_ms': total}
