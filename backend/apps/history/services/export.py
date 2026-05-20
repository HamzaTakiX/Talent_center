"""History export (CSV) with export audit logging."""

from __future__ import annotations

import csv
import io
from datetime import datetime

from django.core.files.base import ContentFile
from django.utils import timezone

from apps.history.models import HistoryExportLog
from apps.history.services.queries import apply_list_filters, base_queryset
from apps.history.services.recorder import record_history_event


def create_csv_export(user, *, filters: dict, max_rows: int = 10_000) -> HistoryExportLog:
    export_log = HistoryExportLog.objects.create(
        export_type=HistoryExportLog.ExportType.CSV,
        filters_json=filters,
        requested_by=user,
        status=HistoryExportLog.Status.RUNNING,
        started_at=timezone.now(),
    )

    try:
        qs = apply_list_filters(base_queryset(user), filters)[:max_rows]
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow([
            'id', 'occurred_at', 'source_app', 'action_code', 'event_code',
            'entity_type', 'entity_id', 'summary', 'severity', 'actor_email',
            'actor_role', 'is_automated', 'visibility_scope',
        ])
        count = 0
        for event in qs.iterator(chunk_size=500):
            writer.writerow([
                event.id,
                event.occurred_at.isoformat(),
                event.source_app,
                event.action_code,
                event.event_code,
                event.entity_type,
                event.entity_id or '',
                event.summary,
                event.severity,
                event.actor_email,
                event.actor_role,
                event.is_automated,
                event.visibility_scope,
            ])
            count += 1

        payload = buffer.getvalue().encode('utf-8-sig')
        filename = f'history_export_{export_log.uuid.hex[:8]}_{datetime.utcnow():%Y%m%d}.csv'
        export_log.file.save(filename, ContentFile(payload), save=False)
        export_log.record_count = count
        export_log.file_size_bytes = len(payload)
        export_log.status = HistoryExportLog.Status.COMPLETED
        export_log.completed_at = timezone.now()
        export_log.save()

        record_history_event(
            event_code='history.export.completed',
            source_app='history',
            action_code='EXPORT',
            summary=f'History export ({count} rows)',
            actor=user,
            entity_type='history_export',
            entity_id=export_log.id,
            severity='INFO',
            payload={'export_uuid': str(export_log.uuid), 'record_count': count},
            metadata={'export_type': 'CSV'},
        )
    except Exception as exc:
        export_log.status = HistoryExportLog.Status.FAILED
        export_log.error_message = str(exc)[:2000]
        export_log.completed_at = timezone.now()
        export_log.save()
        raise

    return export_log
