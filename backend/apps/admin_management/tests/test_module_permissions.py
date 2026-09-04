"""Module-level authorization regression tests.

Scenario from production: an administrator configured with the "Stage" module
only could still reach Finance (and other modules). These tests pin the
behaviour down at the API layer, not in the UI, so a Stage-only admin is refused
even when typing the URL directly.

Run with:
    python manage.py test apps.admin_management.tests --settings=core.settings_test
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts_et_roles.models import Role, UserRoleAssignment
from apps.admin_management.models import AdminProfile
from apps.admin_management.services.admins import (
    ADMIN_ROLE_CODES,
    create_platform_admin,
    get_admin_effective_permissions,
    update_platform_admin,
)
from apps.admin_management.services.rbac_seed import (
    MANAGED_ADMIN_ROLE_CODES,
    ROLE_DEFINITIONS,
    UI_ROLE_TO_CODE,
    seed_admin_rbac,
)

User = get_user_model()

#: One representative endpoint per module, with the permission that guards it.
MODULE_ENDPOINTS = {
    'finance': ('/api/srf/dashboard/summary', 'finance.manage'),
    'finance_students': ('/api/srf/students', 'finance.manage'),
    'finance_analytics': ('/api/srf/analytics', 'finance.manage'),
    'srf_import': ('/api/srf/imports/schema', 'srf.import'),
    'administrators': ('/api/admin/roles', 'admins.manage'),
    'permissions': ('/api/admin/permissions', 'admins.manage'),
    'encadrants': ('/api/admin/encadrants', 'users.manage'),
}


class StageOnlyAdministratorTests(TestCase):
    """User A: Stage allowed, Finance denied, other modules denied."""

    def setUp(self):
        seed_admin_rbac()
        self.jihane = create_platform_admin(
            full_name='Jihane Benali',
            email='jihane@esca.test',
            role_slugs=['stage'],
            permission_keys=['manageInternshipOffers'],
            grant_access=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.jihane)

    def test_effective_permissions_cover_stage_only(self):
        perms = get_admin_effective_permissions(self.jihane)
        self.assertIn('internship.manage', perms)
        for denied in ('finance.manage', 'srf.import', 'srf.financial.manage',
                       'admins.manage', 'platform.settings', 'users.manage'):
            self.assertNotIn(denied, perms, f'{denied} must not be granted by the Stage role')

    def test_is_not_a_super_admin(self):
        self.assertEqual(self.jihane.admin_profile.admin_level, AdminProfile.AdminLevel.STANDARD)
        self.assertFalse(self.jihane.is_superuser)

    def test_stage_module_is_reachable(self):
        response = self.client.get('/api/internship-offers/dashboard')
        self.assertNotIn(response.status_code, (401, 403), response.content[:300])

    def test_can_create_an_internship_offer_draft(self):
        response = self.client.post(
            '/api/internship-offers',
            {
                'title': 'Stage PFE Data Engineer',
                'company_name': 'TechCorp Maroc',
                'description': 'Description complète du poste.',
                'location_city': 'Casablanca',
                'offer_type': 'pfe',
            },
            format='json',
        )
        self.assertNotIn(response.status_code, (401, 403), response.content[:300])

    def test_every_other_module_endpoint_is_refused(self):
        for label, (url, permission) in MODULE_ENDPOINTS.items():
            with self.subTest(module=label, url=url):
                self.assertNotIn(permission, get_admin_effective_permissions(self.jihane))
                response = self.client.get(url)
                self.assertEqual(
                    response.status_code, 403,
                    f'{url} returned {response.status_code}; a Stage-only admin must be refused',
                )

    def test_finance_writes_are_refused_too(self):
        for method, url in (
            ('post', '/api/srf/exam-periods'),
            ('post', '/api/srf/risk-scan'),
            ('post', '/api/admin/encadrants'),
        ):
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method)(url, {}, format='json')
                self.assertEqual(response.status_code, 403, f'{method.upper()} {url} -> {response.status_code}')

    def test_anonymous_access_is_unauthenticated_not_merely_hidden(self):
        anonymous = APIClient()
        for url, _permission in MODULE_ENDPOINTS.values():
            with self.subTest(url=url):
                self.assertEqual(anonymous.get(url).status_code, 401)


class FinanceAdministratorTests(TestCase):
    """The mirror case: a Finance admin keeps Finance and loses Stage-only views."""

    def setUp(self):
        seed_admin_rbac()
        self.admin = create_platform_admin(
            full_name='Karim Finance',
            email='karim@esca.test',
            role_slugs=['finance'],
            permission_keys=['financialOperations'],
            grant_access=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_finance_endpoints_are_reachable(self):
        response = self.client.get('/api/srf/dashboard/summary')
        self.assertNotIn(response.status_code, (401, 403), response.content[:300])

    def test_administrator_management_is_refused(self):
        self.assertEqual(self.client.get('/api/admin/roles').status_code, 403)

    def test_student_profile_intelligence_is_refused(self):
        """These function-based views were guarded by `IsPlatformAdmin` alone.

        `@permission_classes` cannot set `required_permission` on the view class
        `@api_view` builds, so `EffectiveHasPermission` found nothing to check
        and let every platform admin read student intelligence.
        """
        for url in (
            '/api/profile-intelligence/overview/',
            '/api/profile-intelligence/search/',
            '/api/profile-intelligence/program-analytics/',
        ):
            with self.subTest(url=url):
                self.assertNotIn('students.manage', get_admin_effective_permissions(self.admin))
                self.assertEqual(self.client.get(url).status_code, 403)


class SuperAdministratorTests(TestCase):
    """E. The super admin keeps unrestricted access."""

    def setUp(self):
        seed_admin_rbac()
        self.superadmin = create_platform_admin(
            full_name='Root Admin',
            email='root@esca.test',
            role_slugs=[],
            permission_keys=[],
            admin_level=AdminProfile.AdminLevel.SUPER,
            grant_access=True,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.superadmin)

    def test_every_module_endpoint_is_reachable(self):
        for label, (url, _permission) in MODULE_ENDPOINTS.items():
            with self.subTest(module=label, url=url):
                response = self.client.get(url)
                self.assertNotIn(
                    response.status_code, (401, 403),
                    f'{url} returned {response.status_code} for a super admin',
                )

    def test_stage_module_is_reachable(self):
        response = self.client.get('/api/internship-offers/dashboard')
        self.assertNotIn(response.status_code, (401, 403))


class RoleRevocationTests(TestCase):
    """The leak that let a downgraded administrator keep Finance.

    `_sync_role_assignments` only revokes roles listed in `ADMIN_ROLE_CODES`.
    ADMIN_SUPER was missing from that set, so anyone who had ever held it kept
    `finance.manage` (and everything else) after being narrowed to one module.
    """

    def setUp(self):
        seed_admin_rbac()

    def test_managed_role_codes_cover_every_defined_role(self):
        defined = {code for code, _name, _system, _perms in ROLE_DEFINITIONS}
        self.assertEqual(set(MANAGED_ADMIN_ROLE_CODES), defined)
        self.assertIn('ADMIN_SUPER', MANAGED_ADMIN_ROLE_CODES)
        self.assertEqual(set(ADMIN_ROLE_CODES), defined)

    def test_managed_role_codes_cover_every_ui_grantable_role(self):
        self.assertTrue(set(UI_ROLE_TO_CODE.values()).issubset(set(MANAGED_ADMIN_ROLE_CODES)))

    def test_narrowing_to_stage_revokes_a_previously_granted_super_role(self):
        admin = create_platform_admin(
            full_name='Legacy Admin',
            email='legacy@esca.test',
            role_slugs=['finance'],
            permission_keys=[],
            grant_access=True,
        )
        # Simulate the historical grant (seeding / shell / fixture).
        super_role = Role.objects.get(code='ADMIN_SUPER')
        UserRoleAssignment.objects.create(user=admin, role=super_role, is_active=True)
        admin = User.objects.get(pk=admin.pk)
        self.assertIn('finance.manage', get_admin_effective_permissions(admin))

        update_platform_admin(user=admin, role_slugs=['stage'], permission_keys=[])

        admin = User.objects.get(pk=admin.pk)
        perms = get_admin_effective_permissions(admin)
        self.assertIn('internship.manage', perms)
        self.assertNotIn('finance.manage', perms)
        self.assertNotIn('admins.manage', perms)
        self.assertFalse(
            UserRoleAssignment.objects.filter(
                user=admin, role__code__in=('ADMIN_SUPER', 'ADMIN_FINANCE'), is_active=True,
            ).exists(),
        )

    def test_downgraded_admin_can_no_longer_call_finance_apis(self):
        admin = create_platform_admin(
            full_name='Downgraded Admin',
            email='downgraded@esca.test',
            role_slugs=['finance'],
            permission_keys=['financialOperations'],
            grant_access=True,
        )
        client = APIClient()
        client.force_authenticate(user=User.objects.get(pk=admin.pk))
        self.assertNotIn(client.get('/api/srf/dashboard/summary').status_code, (401, 403))

        update_platform_admin(
            user=User.objects.get(pk=admin.pk),
            role_slugs=['stage'],
            permission_keys=['manageInternshipOffers'],
        )

        client = APIClient()
        client.force_authenticate(user=User.objects.get(pk=admin.pk))
        self.assertEqual(client.get('/api/srf/dashboard/summary').status_code, 403)

    def test_unknown_role_slug_is_rejected_instead_of_silently_dropped(self):
        with self.assertRaises(ValueError):
            create_platform_admin(
                full_name='Typo Admin',
                email='typo@esca.test',
                role_slugs=['finanace'],
                permission_keys=[],
            )

    def test_super_slug_round_trips_without_granting_super_admin(self):
        admin = create_platform_admin(
            full_name='Echo Admin',
            email='echo@esca.test',
            role_slugs=['super', 'stage'],
            permission_keys=[],
            grant_access=True,
        )
        admin = User.objects.get(pk=admin.pk)
        self.assertEqual(admin.admin_profile.admin_level, AdminProfile.AdminLevel.STANDARD)
        self.assertFalse(
            UserRoleAssignment.objects.filter(user=admin, role__code='ADMIN_SUPER', is_active=True).exists(),
        )
        self.assertNotIn('finance.manage', get_admin_effective_permissions(admin))


class GuardedViewCoverageTests(TestCase):
    """No admin API may rely on `IsPlatformAdmin` alone for module isolation."""

    def test_admin_management_views_declare_a_required_permission(self):
        import inspect

        from apps.admin_management import views, views_smart_assignment
        from apps.admin_management.permissions import (
            CanManageAdministrators,
            EffectiveHasPermission,
            IsPlatformAdmin,
            IsPlatformAdminOrStudentCatalogRead,
            IsSuperAdmin,
        )

        # Classes that already restrict beyond "is an admin".
        narrowing = (
            EffectiveHasPermission,
            CanManageAdministrators,
            IsSuperAdmin,
            IsPlatformAdminOrStudentCatalogRead,
        )

        offenders = []
        for module in (views, views_smart_assignment):
            for name, obj in inspect.getmembers(module, inspect.isclass):
                permission_classes = getattr(obj, 'permission_classes', None)
                if not permission_classes or obj.__module__ != module.__name__:
                    continue
                if any(issubclass(p, narrowing) for p in permission_classes):
                    continue
                if IsPlatformAdmin in permission_classes:
                    offenders.append(f'{module.__name__}.{name}')

        self.assertEqual(offenders, [], f'Views guarded only by IsPlatformAdmin: {offenders}')

    def test_function_based_admin_views_declare_a_required_permission(self):
        """`@api_view` views are easy to miss: the guard lives on a wrapper class.

        `inspect.isclass` does not see them, so the class-based audit above walks
        straight past `profile_intelligence`, where six endpoints were reachable
        by any platform admin.
        """
        import inspect

        from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
        from apps.profile_intelligence import views as pi_views

        offenders = []
        for name, obj in inspect.getmembers(pi_views, callable):
            view_class = getattr(obj, 'cls', None)
            permission_classes = getattr(view_class, 'permission_classes', None)
            if not permission_classes:
                continue
            if any(issubclass(p, EffectiveHasPermission) for p in permission_classes):
                continue
            if IsPlatformAdmin in permission_classes:
                offenders.append(f'{pi_views.__name__}.{name}')

        self.assertEqual(offenders, [], f'Function views guarded only by IsPlatformAdmin: {offenders}')
