"""Admin SPA routes for history entity deep-links."""

from __future__ import annotations

from typing import Any, Optional


def resolve_entity_path(
    entity_type: str,
    entity_id: int | None,
    metadata: Optional[dict[str, Any]] = None,
) -> str | None:
    if not entity_type:
        return None
    meta = metadata or {}
    et = entity_type.lower()

    if et in ('student_profile', 'student'):
        uid = meta.get('user_id') or entity_id
        if uid:
            return f'/admin/students/{uid}'
    if et == 'admin_user':
        if entity_id:
            return f'/admin/admins/{entity_id}'
    if et == 'encadrant_profile':
        if meta.get('user_id'):
            return f'/admin/encadrants/{meta["user_id"]}'
    if et in ('announcement',):
        if entity_id:
            return f'/admin/announcements/{entity_id}'
    if et in ('stage_offer', 'internship_offer'):
        if entity_id:
            return f'/admin/internship-offers/{entity_id}'
    if et in ('document_request',):
        uuid = meta.get('entity_uuid')
        if uuid:
            return f'/admin/documents/{uuid}'
    if et in ('payment_proof', 'financial_account'):
        return '/admin/srf'
    if et in ('supervision_meeting', 'meeting'):
        if entity_id:
            return f'/admin/encadrant/meetings/{entity_id}'
    if et in ('supervision_report', 'report'):
        if entity_id:
            return f'/admin/encadrants/reports/{entity_id}'
    if et == 'assignment_run':
        return '/admin/encadrant/smart-assignment'
    return None
