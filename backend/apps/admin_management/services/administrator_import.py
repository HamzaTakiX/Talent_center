"""Bulk platform administrator import from CSV or Excel files."""

from __future__ import annotations

from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.admin_management.models import Filiere, ImportLog

from .admins import create_platform_admin
from .import_common import (
    parse_bool,
    parse_csv_list,
    parse_import_file,
    parse_int,
    validate_import_upload,
)
from .rbac_seed import UI_ROLE_TO_CODE

COLUMN_ALIASES: dict[str, str] = {
    'email': 'email',
    'e-mail': 'email',
    'courriel': 'email',
    'mail': 'email',
    'full_name': 'full_name',
    'fullname': 'full_name',
    'name': 'full_name',
    'nom_complet': 'full_name',
    'nom': 'full_name',
    'role_slugs': 'role_slugs',
    'roles': 'role_slugs',
    'role': 'role_slugs',
    'filiere_ids': 'filiere_ids',
    'filiere_codes': 'filiere_codes',
    'filiere': 'filiere_codes',
    'programme': 'filiere_codes',
    'grant_access': 'grant_access',
    'acces_plateforme': 'grant_access',
    'platform_access': 'grant_access',
    'sso_enabled': 'sso_enabled',
    'sso': 'sso_enabled',
}


def _resolve_filiere_ids(*, filiere_ids_raw: str, filiere_codes_raw: str) -> list[int]:
    ids: list[int] = []
    for part in parse_csv_list(filiere_ids_raw):
        parsed = parse_int(part)
        if parsed is not None:
            ids.append(parsed)
    for code in parse_csv_list(filiere_codes_raw):
        filiere = Filiere.objects.filter(code__iexact=code, is_active=True).first()
        if filiere is None:
            raise ValueError(f'Unknown program code: {code}')
        ids.append(filiere.id)
    return list(dict.fromkeys(ids))


def _parse_role_slugs(raw: str) -> list[str]:
    slugs = [s.strip().lower() for s in parse_csv_list(raw)]
    invalid = [s for s in slugs if s not in UI_ROLE_TO_CODE]
    if invalid:
        allowed = ', '.join(sorted(UI_ROLE_TO_CODE))
        raise ValueError(f'Unknown role slug(s): {", ".join(invalid)}. Allowed: {allowed}.')
    return slugs


def _row_to_admin_kwargs(row: dict[str, Any]) -> dict[str, Any]:
    email = str(row.get('email') or '').strip()
    if not email:
        raise ValueError('Email is required.')

    full_name = str(row.get('full_name') or '').strip()
    if not full_name:
        raise ValueError('Full name is required.')

    role_slugs = _parse_role_slugs(str(row.get('role_slugs') or ''))
    filiere_ids = _resolve_filiere_ids(
        filiere_ids_raw=str(row.get('filiere_ids') or ''),
        filiere_codes_raw=str(row.get('filiere_codes') or ''),
    )

    return {
        'email': email,
        'full_name': full_name,
        'role_slugs': role_slugs,
        'permission_keys': [],
        'filiere_ids': filiere_ids,
        'sso_enabled': parse_bool(row.get('sso_enabled')),
        'grant_access': parse_bool(row.get('grant_access')),
    }


def import_administrators_from_file(*, content: bytes, filename: str, created_by) -> dict[str, Any]:
    rows = parse_import_file(content=content, filename=filename, aliases=COLUMN_ALIASES)
    validate_import_upload(filename=filename, rows=rows)

    log = ImportLog.objects.create(
        import_type=ImportLog.ImportType.ROLES,
        status=ImportLog.Status.RUNNING,
        source_filename=filename[:255],
        total_rows=len(rows),
        started_by=created_by,
        started_at=timezone.now(),
    )

    errors: list[dict[str, Any]] = []
    success_count = 0

    for index, row in enumerate(rows, start=2):
        try:
            kwargs = _row_to_admin_kwargs(row)
        except ValueError as exc:
            errors.append({'row': index, 'email': str(row.get('email') or ''), 'message': str(exc)})
            continue

        try:
            with transaction.atomic():
                create_platform_admin(created_by=created_by, **kwargs)
            success_count += 1
        except ValueError as exc:
            errors.append({'row': index, 'email': kwargs.get('email', ''), 'message': str(exc)})
        except Exception as exc:
            errors.append({'row': index, 'email': kwargs.get('email', ''), 'message': str(exc)})

    error_count = len(errors)
    if success_count == 0 and error_count > 0:
        log_status = ImportLog.Status.FAILED
    elif error_count > 0:
        log_status = ImportLog.Status.PARTIAL
    else:
        log_status = ImportLog.Status.COMPLETED

    log.status = log_status
    log.success_rows = success_count
    log.error_rows = error_count
    log.errors_json = errors
    log.summary_json = {
        'total_rows': len(rows),
        'success_rows': success_count,
        'error_rows': error_count,
    }
    log.completed_at = timezone.now()
    log.save(
        update_fields=[
            'status',
            'success_rows',
            'error_rows',
            'errors_json',
            'summary_json',
            'completed_at',
        ],
    )

    return {
        'import_log_id': log.id,
        'total_rows': len(rows),
        'success_rows': success_count,
        'error_rows': error_count,
        'errors': errors,
        'status': log_status,
    }
