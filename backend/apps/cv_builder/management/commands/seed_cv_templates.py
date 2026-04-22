from django.core.management.base import BaseCommand

from apps.cv_builder.services.template_service import (
    BUILTIN_TEMPLATES,
    seed_builtin_templates,
)


class Command(BaseCommand):
    help = 'Idempotently seed the built-in CV templates (Modern Split, Classic Single, Minimal Clean).'

    def handle(self, *args, **options):
        result = seed_builtin_templates()
        for code, tpl in result.items():
            self.stdout.write(self.style.SUCCESS(
                f'Upserted template: {code} (id={tpl.pk}, is_default={tpl.is_default})'
            ))
        self.stdout.write(self.style.SUCCESS(
            f'Done. {len(BUILTIN_TEMPLATES)} template(s) processed.'
        ))
