from django.core.management.base import BaseCommand

from apps.stage.models import InternshipOffer
from apps.stage.services.notifications import notify_deadline_reminder, notify_offer_expiring
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Send offer deadline reminders'

    def handle(self, *args, **options):
        now = timezone.now()
        count = 0
        offers = InternshipOffer.objects.filter(
            status=InternshipOffer.Status.PUBLISHED,
            application_deadline__isnull=False,
        )
        for offer in offers:
            remaining = (offer.application_deadline - now).days
            if remaining in (3, 1, 0):
                notify_offer_expiring(offer, max(remaining, 1))
                notify_deadline_reminder(offer)
                count += 1
        self.stdout.write(self.style.SUCCESS(f'Processed {count} offer reminders'))
