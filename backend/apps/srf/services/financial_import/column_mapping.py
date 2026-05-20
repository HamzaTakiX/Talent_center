"""Column mapping — target fields and automatic suggestions."""

from __future__ import annotations

import re
from typing import Any

TARGET_FIELDS: list[dict[str, str]] = [
    {'key': 'student_number', 'label': 'Student number', 'required': True},
    {'key': 'email', 'label': 'Email'},
    {'key': 'academic_year', 'label': 'Academic year'},
    {'key': 'payment_plan_type', 'label': 'Payment plan (FULL / INSTALLMENTS)'},
    {'key': 'total_amount', 'label': 'Total amount'},
    {'key': 'paid_amount', 'label': 'Paid amount'},
    {'key': 'remaining_amount', 'label': 'Remaining amount'},
    {'key': 'financial_status', 'label': 'Financial status'},
    {'key': 'currency', 'label': 'Currency'},
    {'key': 'installment_1_amount', 'label': 'Installment 1 amount'},
    {'key': 'installment_1_status', 'label': 'Installment 1 status'},
    {'key': 'installment_1_due_date', 'label': 'Installment 1 due date'},
    {'key': 'installment_2_amount', 'label': 'Installment 2 amount'},
    {'key': 'installment_2_status', 'label': 'Installment 2 status'},
    {'key': 'installment_2_due_date', 'label': 'Installment 2 due date'},
    {'key': 'installment_3_amount', 'label': 'Installment 3 amount'},
    {'key': 'installment_3_status', 'label': 'Installment 3 status'},
    {'key': 'installment_3_due_date', 'label': 'Installment 3 due date'},
    {'key': 'installment_4_amount', 'label': 'Installment 4 amount'},
    {'key': 'installment_4_status', 'label': 'Installment 4 status'},
    {'key': 'installment_4_due_date', 'label': 'Installment 4 due date'},
]

COLUMN_ALIASES: dict[str, str] = {
    'student_number': 'student_number',
    'studentnumber': 'student_number',
    'numero_etudiant': 'student_number',
    'numéro_etudiant': 'student_number',
    'numero': 'student_number',
    'matricule': 'student_number',
    'email': 'email',
    'e-mail': 'email',
    'courriel': 'email',
    'mail': 'email',
    'academic_year': 'academic_year',
    'annee_academique': 'academic_year',
    'année_académique': 'academic_year',
    'annee': 'academic_year',
    'payment_plan_type': 'payment_plan_type',
    'plan_paiement': 'payment_plan_type',
    'plan': 'payment_plan_type',
    'total_amount': 'total_amount',
    'montant_total': 'total_amount',
    'total': 'total_amount',
    'paid_amount': 'paid_amount',
    'montant_paye': 'paid_amount',
    'montant_payé': 'paid_amount',
    'paye': 'paid_amount',
    'payé': 'paid_amount',
    'remaining_amount': 'remaining_amount',
    'montant_restant': 'remaining_amount',
    'restant': 'remaining_amount',
    'solde': 'remaining_amount',
    'financial_status': 'financial_status',
    'statut_financier': 'financial_status',
    'statut': 'financial_status',
    'status': 'financial_status',
    'currency': 'currency',
    'devise': 'currency',
    'tranche_1': 'installment_1_amount',
    'tranche1': 'installment_1_amount',
    'installment_1': 'installment_1_amount',
    'tranche_1_montant': 'installment_1_amount',
    'tranche_1_statut': 'installment_1_status',
    'tranche_2': 'installment_2_amount',
    'tranche2': 'installment_2_amount',
    'installment_2': 'installment_2_amount',
    'tranche_2_montant': 'installment_2_amount',
    'tranche_2_statut': 'installment_2_status',
    'tranche_3': 'installment_3_amount',
    'tranche_3_montant': 'installment_3_amount',
    'tranche_3_statut': 'installment_3_status',
    'tranche_4': 'installment_4_amount',
    'tranche_4_montant': 'installment_4_amount',
    'tranche_4_statut': 'installment_4_status',
}


def _normalize_header(value: str) -> str:
    key = value.strip().lower().replace(' ', '_')
    key = re.sub(r'[^a-z0-9_àâäéèêëïîôùûüç]', '', key)
    return COLUMN_ALIASES.get(key, key)


def suggest_column_mapping(headers: list[str]) -> dict[str, str]:
    """Map source column names → target field keys."""
    mapping: dict[str, str] = {}
    used_targets: set[str] = set()
    for header in headers:
        if not header:
            continue
        normalized = _normalize_header(header)
        if normalized in {f['key'] for f in TARGET_FIELDS} and normalized not in used_targets:
            mapping[header] = normalized
            used_targets.add(normalized)
    return mapping


def apply_mapping_to_row(row: dict[str, Any], mapping: dict[str, str]) -> dict[str, Any]:
    """Transform a raw row using column mapping (source header → target field)."""
    mapped: dict[str, Any] = {}
    for source_col, value in row.items():
        target = mapping.get(source_col) or mapping.get(_normalize_header(source_col))
        if not target:
            normalized = _normalize_header(str(source_col))
            if normalized in {f['key'] for f in TARGET_FIELDS}:
                target = normalized
        if target:
            mapped[target] = value
    return mapped


def get_target_fields_schema() -> list[dict[str, Any]]:
    return [
        {'key': f['key'], 'label': f['label'], 'required': f.get('required', False)}
        for f in TARGET_FIELDS
    ]
