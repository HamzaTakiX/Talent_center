"""Bulk encadrant (supervisor) import from CSV or Excel files."""

from __future__ import annotations

from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.admin_management.models import Filiere, ImportLog, SpecializationDomain

from .encadrant_scope import normalize_encadrant_scope, parse_scope_lists_from_import_row
from .encadrants import create_platform_encadrant
from .import_common import (
    parse_bool,
    parse_csv_list,
    parse_import_file,
    parse_int,
    validate_import_upload,
)

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
    'filiere_ids': 'filiere_ids',
    'filiere_codes': 'filiere_codes',
    'filiere': 'filiere_codes',
    'programmes': 'filiere_codes',
    'programme': 'filiere_codes',
    'level_ids': 'level_ids',
    'level_codes': 'level_codes',
    'niveaux': 'level_codes',
    'niveau': 'level_codes',
    'levels': 'level_codes',
    'academic_years': 'academic_years',
    'academic_year': 'academic_years',
    'annee_academique': 'academic_years',
    'année_académique': 'academic_years',
    'annees_academiques': 'academic_years',
    'supervised_internship_type_ids': 'supervised_internship_type_ids',
    'internship_type_ids': 'supervised_internship_type_ids',
    'supervised_internship_type_codes': 'supervised_internship_type_codes',
    'internship_type_codes': 'supervised_internship_type_codes',
    'types_stage': 'supervised_internship_type_codes',
    'class_group_ids': 'class_group_ids',
    'class_group_codes': 'class_group_codes',
    'classe': 'class_group_codes',
    'max_students': 'max_students',
    'capacity': 'max_students',
    'capacite': 'max_students',
    'grant_access': 'grant_access',
    'acces_plateforme': 'grant_access',
    'platform_access': 'grant_access',
    'is_active': 'is_active',
    'actif': 'is_active',
    'specialization_domain_codes': 'specialization_domain_codes',
    'specialization_codes': 'specialization_domain_codes',
    'domaines': 'specialization_domain_codes',
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
    resolved = list(dict.fromkeys(ids))
    if not resolved:
        raise ValueError('At least one program code or filière id is required.')
    return resolved


def _resolve_specialization_domain_ids(codes_raw: str) -> list[int]:
    ids: list[int] = []
    for code in parse_csv_list(codes_raw):
        domain = SpecializationDomain.objects.filter(code__iexact=code, is_active=True).first()
        if domain is None:
            raise ValueError(f'Unknown specialization domain code: {code}')
        ids.append(domain.id)
    return list(dict.fromkeys(ids))


def _row_to_encadrant_kwargs(row: dict[str, Any]) -> dict[str, Any]:
    email = str(row.get('email') or '').strip()
    if not email:
        raise ValueError('Email is required.')

    full_name = str(row.get('full_name') or '').strip()
    if not full_name:
        raise ValueError('Full name is required.')

    filiere_ids = _resolve_filiere_ids(
        filiere_ids_raw=str(row.get('filiere_ids') or ''),
        filiere_codes_raw=str(row.get('filiere_codes') or ''),
    )
    scope_raw = parse_scope_lists_from_import_row(row)
    scope = normalize_encadrant_scope(
        filiere_ids=filiere_ids,
        level_ids=scope_raw['level_ids'] or None,
        level_codes=scope_raw['level_codes'] or None,
        academic_years=scope_raw['academic_years'] or None,
        supervised_internship_type_ids=scope_raw['supervised_internship_type_ids'] or None,
        supervised_internship_type_codes=scope_raw['supervised_internship_type_codes'] or None,
        class_group_ids=scope_raw['class_group_ids'] or None,
        class_group_codes=scope_raw['class_group_codes'] or None,
        infer_missing=True,
        strict=True,
    )
    specialization_domain_ids = _resolve_specialization_domain_ids(
        str(row.get('specialization_domain_codes') or ''),
    )
    max_students = parse_int(row.get('max_students'))
    if max_students is None:
        max_students = 15

    return {
        'email': email,
        'full_name': full_name,
        'filiere_ids': scope['filiere_ids'],
        'class_group_ids': scope['class_group_ids'],
        'level_ids': scope['level_ids'],
        'academic_years': scope['academic_years'],
        'supervised_internship_type_ids': scope['supervised_internship_type_ids'],
        'specialization_domain_ids': specialization_domain_ids,
        'max_students': max_students,
        'grant_access': parse_bool(row.get('grant_access')),
        'is_active': parse_bool(row.get('is_active')) if row.get('is_active') not in (None, '') else True,
    }


def import_encadrants_from_file(*, content: bytes, filename: str, created_by) -> dict[str, Any]:
    rows = parse_import_file(content=content, filename=filename, aliases=COLUMN_ALIASES)
    validate_import_upload(filename=filename, rows=rows)

    log = ImportLog.objects.create(
        import_type=ImportLog.ImportType.ENCADRANTS,
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
            kwargs = _row_to_encadrant_kwargs(row)
        except ValueError as exc:
            errors.append({'row': index, 'email': str(row.get('email') or ''), 'message': str(exc)})
            continue

        try:
            with transaction.atomic():
                create_platform_encadrant(created_by=created_by, **kwargs)
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
