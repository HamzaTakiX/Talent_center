"""Seed system roles and permissions for platform administrators."""

from django.db import transaction

from apps.accounts_et_roles.models import Permission, Role, RolePermission

# Frontend permission keys → backend permission codes
PERMISSION_DEFINITIONS = [
    ('internship.manage', 'Manage internship offers', 'internship'),
    ('announcements.create', 'Create announcements', 'announcements'),
    ('announcements.view', 'View announcements', 'announcements'),
    ('announcements.edit', 'Edit announcements', 'announcements'),
    ('announcements.publish', 'Publish announcements', 'announcements'),
    ('announcements.archive', 'Archive announcements', 'announcements'),
    ('announcements.analytics', 'Access announcement analytics', 'announcements'),
    ('announcements.targeting', 'Manage announcement targeting', 'announcements'),
    ('announcements.types.manage', 'Manage announcement types', 'announcements'),
    ('announcements.recommendation.manage', 'Manage recommendation rules', 'announcements'),
    ('finance.manage', 'Financial operations', 'finance'),
    ('srf.import', 'Import SRF financial data', 'srf'),
    ('srf.financial.manage', 'Manage SRF financial operations', 'srf'),
    ('srf.financial.audit', 'Audit SRF financial imports', 'srf'),
    ('users.manage', 'User management', 'users'),
    ('students.manage', 'Manage students', 'students'),
    ('documents.validate', 'Validate documents', 'documents'),
    ('documents.manage', 'Manage document types and workflows', 'documents'),
    ('documents.reservations', 'Manage document reservations', 'documents'),
    ('documents.templates', 'Manage document templates', 'documents'),
    ('documents.analytics', 'Access document analytics', 'documents'),
    ('reports.access', 'Access reports', 'reports'),
    ('reports.review', 'Review supervision reports', 'reports'),
    ('reports.escalate', 'Escalate supervision reports', 'reports'),
    ('reports.assign', 'Assign report reviewers', 'reports'),
    ('reports.export', 'Export supervision reports', 'reports'),
    ('reports.configure', 'Configure report templates and obligations', 'reports'),
    ('meetings.access', 'Access supervision meetings', 'meetings'),
    ('meetings.manage', 'Manage supervision meetings', 'meetings'),
    ('platform.settings', 'Platform settings', 'platform'),
    ('admins.manage', 'Manage administrators', 'admins'),
    ('history.global.access', 'Access global audit & history center', 'history'),
    ('history.export', 'Export audit trails and investigation reports', 'history'),
    ('history.entity.read', 'Read entity-level activity timelines', 'history'),
]

# Frontend role slugs → backend role codes with default permissions
ROLE_DEFINITIONS = [
    (
        'ADMIN_SUPER',
        'Super Administrator',
        True,
        [
            'internship.manage', 'announcements.create', 'announcements.view',
            'announcements.edit', 'announcements.publish', 'announcements.archive',
            'announcements.analytics', 'announcements.targeting',
            'announcements.types.manage', 'announcements.recommendation.manage',
            'finance.manage',
            'srf.import', 'srf.financial.manage', 'srf.financial.audit',
            'users.manage', 'students.manage', 'documents.validate', 'documents.manage',
            'documents.reservations', 'documents.templates', 'documents.analytics',
            'reports.access', 'reports.review', 'reports.escalate', 'reports.assign',
            'reports.export', 'reports.configure',
            'meetings.access', 'meetings.manage',
            'platform.settings', 'admins.manage',
            'history.global.access', 'history.export', 'history.entity.read',
        ],
    ),
    (
        'ADMIN_INTERNSHIP',
        'Internship Administrator',
        True,
        [
            'internship.manage', 'students.manage', 'reports.access',
            'reports.review', 'reports.escalate', 'reports.assign', 'reports.export',
            'meetings.access', 'meetings.manage',
            'history.entity.read',
        ],
    ),
    (
        'ADMIN_FINANCE',
        'Financial Administrator',
        True,
        [
            'finance.manage', 'srf.import', 'srf.financial.manage',
            'srf.financial.audit', 'reports.access',
            'history.entity.read',
        ],
    ),
    (
        'ADMIN_DOCUMENTS',
        'Documents Administrator',
        True,
        [
            'documents.validate', 'documents.manage', 'documents.reservations',
            'documents.templates', 'documents.analytics', 'students.manage',
        ],
    ),
    (
        'ADMIN_COMMUNICATION',
        'Communication Administrator',
        True,
        [
            'announcements.create', 'announcements.view', 'announcements.edit',
            'announcements.publish', 'announcements.archive', 'announcements.analytics',
            'announcements.targeting', 'announcements.types.manage',
            'announcements.recommendation.manage', 'reports.access',
            'history.entity.read',
        ],
    ),
    (
        'ADMIN_COORDINATOR',
        'Encadrant Coordinator',
        True,
        [
            'students.manage', 'users.manage', 'reports.access',
            'meetings.access', 'meetings.manage', 'history.entity.read',
        ],
    ),
    (
        'ADMIN_ACADEMIC',
        'Academic / Student Affairs Administrator',
        True,
        ['students.manage', 'users.manage', 'reports.access', 'meetings.access'],
    ),
]

# UI role slug → backend role code
UI_ROLE_TO_CODE = {
    'stage': 'ADMIN_INTERNSHIP',
    'finance': 'ADMIN_FINANCE',
    'documents': 'ADMIN_DOCUMENTS',
    'communication': 'ADMIN_COMMUNICATION',
    'coordinator': 'ADMIN_COORDINATOR',
    'academic': 'ADMIN_ACADEMIC',
}

# UI permission key → backend permission code
UI_PERMISSION_TO_CODE = {
    'manageInternshipOffers': 'internship.manage',
    'createAnnouncements': 'announcements.create',
    'financialOperations': 'finance.manage',
    'srfFinancialImport': 'srf.import',
    'srfFinancialManage': 'srf.financial.manage',
    'srfFinancialAudit': 'srf.financial.audit',
    'userManagement': 'users.manage',
    'manageStudents': 'students.manage',
    'validateDocuments': 'documents.validate',
    'accessReports': 'reports.access',
    'reviewReports': 'reports.review',
    'escalateReports': 'reports.escalate',
    'assignReportReviewers': 'reports.assign',
    'exportReports': 'reports.export',
    'configureReports': 'reports.configure',
    'platformSettings': 'platform.settings',
}


@transaction.atomic
def seed_admin_rbac() -> dict:
    """Idempotently seed permissions and system roles."""
    perm_by_code = {}
    for code, name, module in PERMISSION_DEFINITIONS:
        perm, _ = Permission.objects.update_or_create(
            code=code,
            defaults={'name': name, 'module': module},
        )
        perm_by_code[code] = perm

    roles_created = 0
    for code, name, is_system, perm_codes in ROLE_DEFINITIONS:
        role, created = Role.objects.update_or_create(
            code=code,
            defaults={'name': name, 'is_system': is_system},
        )
        if created:
            roles_created += 1
        for perm_code in perm_codes:
            perm = perm_by_code.get(perm_code)
            if perm:
                RolePermission.objects.get_or_create(role=role, permission=perm)

    return {
        'permissions': len(perm_by_code),
        'roles': len(ROLE_DEFINITIONS),
        'roles_created': roles_created,
    }
