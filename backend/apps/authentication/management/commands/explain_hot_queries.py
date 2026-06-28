"""
Run EXPLAIN (ANALYZE, BUFFERS) on hot-path SQL for performance tuning.

Usage:
    python manage.py explain_hot_queries
    python manage.py explain_hot_queries --analyze
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import connection

User = get_user_model()

HOT_QUERIES = {
    'notification_unread_count': """
        SELECT COUNT(*) AS "__count"
        FROM "notifications_notification"
        WHERE "notifications_notification"."recipient_id" = %s
          AND NOT "notifications_notification"."is_read"
          AND NOT "notifications_notification"."is_archived"
    """,
    'notification_feed_page': """
        SELECT "notifications_notification"."id"
        FROM "notifications_notification"
        WHERE "notifications_notification"."recipient_id" = %s
          AND NOT "notifications_notification"."is_archived"
        ORDER BY "notifications_notification"."created_at" DESC
        LIMIT 20
    """,
    'login_session_by_jti': """
        SELECT "authentication_loginsession"."id",
               "authentication_loginsession"."revoked_at",
               "authentication_loginsession"."expires_at"
        FROM "authentication_loginsession"
        WHERE "authentication_loginsession"."jti" = %s
        LIMIT 1
    """,
    'user_role_permissions': """
        SELECT "accounts_et_roles_permission"."code"
        FROM "accounts_et_roles_rolepermission"
        INNER JOIN "accounts_et_roles_userroleassignment"
            ON ("accounts_et_roles_rolepermission"."role_id" = "accounts_et_roles_userroleassignment"."role_id")
        INNER JOIN "accounts_et_roles_permission"
            ON ("accounts_et_roles_rolepermission"."permission_id" = "accounts_et_roles_permission"."id")
        WHERE "accounts_et_roles_userroleassignment"."user_id" = %s
          AND "accounts_et_roles_userroleassignment"."is_active"
    """,
    'active_filieres': """
        SELECT "admin_management_filiere"."id"
        FROM "admin_management_filiere"
        WHERE "admin_management_filiere"."is_active"
          AND NOT "admin_management_filiere"."is_archived"
        ORDER BY "admin_management_filiere"."sort_order" ASC,
                 "admin_management_filiere"."name" ASC
    """,
}


class Command(BaseCommand):
    help = 'EXPLAIN hot-path SQL used by auth, notifications, and reference endpoints.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--analyze',
            action='store_true',
            help='Use EXPLAIN ANALYZE (executes queries; use on staging only).',
        )
        parser.add_argument(
            '--user-id',
            type=int,
            default=None,
            help='User id for parameterized queries (defaults to first user).',
        )

    def handle(self, *args, **options):
        user_id = options['user_id']
        if user_id is None:
            user_id = User.objects.order_by('id').values_list('id', flat=True).first()
        if user_id is None:
            self.stderr.write('No users in database — create one first.')
            return

        sample_jti = 'sample-jti-for-plan-only'
        params_map = {
            'notification_unread_count': [user_id],
            'notification_feed_page': [user_id],
            'login_session_by_jti': [sample_jti],
            'user_role_permissions': [user_id],
            'active_filieres': [],
        }

        prefix = 'EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)' if options['analyze'] else 'EXPLAIN (FORMAT TEXT)'

        for name, sql in HOT_QUERIES.items():
            self.stdout.write(self.style.MIGRATE_HEADING(f'\n=== {name} ==='))
            with connection.cursor() as cursor:
                cursor.execute(f'{prefix} {sql}', params_map[name])
                for row in cursor.fetchall():
                    self.stdout.write(row[0])

        self.stdout.write(self.style.SUCCESS('\nDone. Look for Seq Scan, Sort, and high actual time rows.'))
