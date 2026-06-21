"""Seed default email system configuration."""

from django.core.management.base import BaseCommand

from apps.notifications.services.email_config_service import seed_email_system_defaults


class Command(BaseCommand):
    help = 'Seed platform email system defaults (settings, categories, senders)'

    def handle(self, *args, **options):
        seed_email_system_defaults()
        self.stdout.write(self.style.SUCCESS('Email system defaults seeded.'))
