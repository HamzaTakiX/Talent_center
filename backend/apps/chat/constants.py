"""Chat domain constants — modules, channels, contextual tags."""

GLOBAL_CHANNEL_SEEDS = [
    {
        'code': 'announcements',
        'name': '#announcements',
        'description': 'Enterprise-wide announcements and broadcasts.',
        'channel_type': 'ANNOUNCEMENT',
    },
    {
        'code': 'support-stage',
        'name': '#support-stage',
        'description': 'Internship support and stage coordination.',
        'channel_type': 'PUBLIC',
    },
    {
        'code': 'documents',
        'name': '#documents',
        'description': 'Document workflow operations desk.',
        'channel_type': 'PUBLIC',
    },
    {
        'code': 'srf',
        'name': '#srf',
        'description': 'Financial compliance and SRF student support.',
        'channel_type': 'PUBLIC',
    },
    {
        'code': 'urgent-cases',
        'name': '#urgent-cases',
        'description': 'Critical escalations across modules.',
        'channel_type': 'PUBLIC',
    },
    {
        'code': 'encadrants',
        'name': '#encadrants',
        'description': 'Supervision and encadrant coordination.',
        'channel_type': 'PUBLIC',
    },
    {
        'code': 'administration',
        'name': '#administration',
        'description': 'Platform administration coordination.',
        'channel_type': 'PRIVATE',
    },
]

SYSTEM_TAG_SEEDS = [
    {'code': 'report', 'name': 'Report', 'color': '#5ba3ff'},
    {'code': 'task', 'name': 'Task', 'color': '#a78bfa'},
    {'code': 'meeting', 'name': 'Meeting', 'color': '#22d3ee'},
    {'code': 'correction', 'name': 'Correction', 'color': '#f59e0b'},
    {'code': 'validation', 'name': 'Validation', 'color': '#22c55e'},
    {'code': 'feedback', 'name': 'Feedback', 'color': '#94a3b8'},
    {'code': 'urgency', 'name': 'Urgency', 'color': '#ef4444'},
    {'code': 'blockage', 'name': 'Blockage', 'color': '#dc2626'},
    {'code': 'internship_followup', 'name': 'Internship follow-up', 'color': '#8b5cf6'},
    {'code': 'internal_note', 'name': 'Internal note', 'color': '#64748b'},
    {'code': 'escalation', 'name': 'Escalation', 'color': '#b91c1c'},
    {'code': 'financial_warning', 'name': 'Financial warning', 'color': '#ea580c'},
]

# Tags reserved for staff (admin / supervisor) — hidden from students in every module.
STAFF_ONLY_TAG_CODES = frozenset({
    'internal_note',
    'escalation',
})

# Admin-only tags within specific modules (e.g. SRF financial alerts).
ADMIN_ONLY_TAG_CODES = frozenset({
    'financial_warning',
})

# Per-app chat tag catalogs — each module only exposes tags relevant to that workflow.
MODULE_TAG_CATALOG: dict[str, frozenset[str]] = {
    'encadrant': frozenset({
        'report',
        'task',
        'meeting',
        'correction',
        'feedback',
        'blockage',
        'validation',
        'urgency',
        'internal_note',
        'escalation',
    }),
    'documents': frozenset({
        'correction',
        'validation',
        'feedback',
        'blockage',
        'urgency',
        'internal_note',
        'escalation',
    }),
    'srf': frozenset({
        'correction',
        'validation',
        'feedback',
        'blockage',
        'urgency',
        'financial_warning',
        'internal_note',
        'escalation',
    }),
    'offers': frozenset({
        'internship_followup',
        'meeting',
        'task',
        'feedback',
        'correction',
        'blockage',
        'validation',
        'urgency',
        'internal_note',
        'escalation',
    }),
    'announcements': frozenset({
        'feedback',
        'urgency',
        'task',
        'correction',
        'internal_note',
        'escalation',
    }),
    'platform': frozenset({
        'feedback',
        'urgency',
        'task',
        'correction',
        'blockage',
        'meeting',
        'internal_note',
        'escalation',
    }),
}

SMART_ACTION_CODES = frozenset({
    'create_task',
    'create_meeting',
    'request_correction',
    'validate',
    'escalate',
    'notify_admin',
    'mark_urgent',
    'mark_resolved',
    'archive_conversation',
    'unarchive_conversation',
    'assign_admin',
    'set_priority',
    'add_internal_note',
})

# Internal admin actions that must not appear in the student chat timeline.
STUDENT_HIDDEN_SMART_ACTIONS = frozenset({
    'archive_conversation',
    'unarchive_conversation',
    'assign_admin',
    'add_internal_note',
    'set_priority',
    'notify_admin',
    'mark_urgent',
    'escalate',
})

# Smart actions restricted to admin / superuser roles.
ADMIN_ONLY_SMART_ACTIONS = frozenset({
    *STUDENT_HIDDEN_SMART_ACTIONS,
    'mark_resolved',
    'mark_urgent',
    'escalate',
    'assign_admin',
})
