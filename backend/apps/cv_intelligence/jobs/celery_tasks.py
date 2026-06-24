"""Celery background jobs for CV Intelligence."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def run_cv_intelligence_analysis_async(report_context: dict) -> str:
    """Run analysis in background. Returns report UUID."""
    try:
        from celery import shared_task
    except ImportError:
        from .orchestrator import run_cv_intelligence_analysis
        from apps.accounts_et_roles.models import StudentProfile
        from apps.cv_builder.models import StudentCv

        student = StudentProfile.objects.get(pk=report_context['student_id'])
        student_cv = None
        if report_context.get('student_cv_id'):
            student_cv = StudentCv.objects.filter(pk=report_context['student_cv_id']).first()

        report = run_cv_intelligence_analysis(
            student=student,
            source_type=report_context['source_type'],
            builder_payload=report_context.get('builder_payload'),
            file_bytes=report_context.get('file_bytes'),
            filename=report_context.get('filename', ''),
            student_cv=student_cv,
            lang=report_context.get('lang'),
        )
        return str(report.uuid)


try:
    from celery import shared_task

    @shared_task(bind=True, max_retries=2, default_retry_delay=30)
    def run_cv_intelligence_analysis_task(self, report_context: dict) -> str:
        from apps.accounts_et_roles.models import StudentProfile
        from apps.cv_builder.models import StudentCv
        from apps.cv_intelligence.services.orchestrator import run_cv_intelligence_analysis

        try:
            student = StudentProfile.objects.get(pk=report_context['student_id'])
            student_cv = None
            if report_context.get('student_cv_id'):
                student_cv = StudentCv.objects.filter(pk=report_context['student_cv_id']).first()

            report = run_cv_intelligence_analysis(
                student=student,
                source_type=report_context['source_type'],
                builder_payload=report_context.get('builder_payload'),
                file_bytes=report_context.get('file_bytes'),
                filename=report_context.get('filename', ''),
                student_cv=student_cv,
                lang=report_context.get('lang'),
            )
            return str(report.uuid)
        except Exception as exc:
            logger.exception('CV intelligence task failed')
            raise self.retry(exc=exc) from exc

except ImportError:
    run_cv_intelligence_analysis_task = None
