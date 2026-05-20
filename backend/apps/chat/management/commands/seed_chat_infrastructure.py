from django.core.management.base import BaseCommand

from apps.chat.services.seed import seed_chat_infrastructure


class Command(BaseCommand):
    help = 'Seed enterprise chat channels and system contextual tags.'

    def handle(self, *args, **options):
        result = seed_chat_infrastructure()
        self.stdout.write(
            self.style.SUCCESS(
                f'Chat infrastructure seeded: {result["channels_created"]} channels, '
                f'{result["tags_created"]} tags created.'
            )
        )
