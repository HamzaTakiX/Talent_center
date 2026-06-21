"""Shared notification constants."""

from django.db import models
from django.utils.translation import gettext_lazy as _


class Priority(models.TextChoices):
    LOW = 'LOW', _('Low')
    NORMAL = 'NORMAL', _('Normal')
    HIGH = 'HIGH', _('High')
    URGENT = 'URGENT', _('Urgent')


class EventStatus(models.TextChoices):
    RECEIVED = 'RECEIVED', _('Received')
    PROCESSING = 'PROCESSING', _('Processing')
    PROCESSED = 'PROCESSED', _('Processed')
    FAILED = 'FAILED', _('Failed')
    SKIPPED = 'SKIPPED', _('Skipped')


class Category(models.TextChoices):
    OFFERS = 'offers', _('Offers')
    APPLICATIONS = 'applications', _('Applications')
    DOCUMENTS = 'documents', _('Documents')
    ANNOUNCEMENTS = 'announcements', _('Announcements')
    CHAT = 'chat', _('Chat')
    SRF = 'srf', _('SRF')
    CV_ANALYSIS = 'cv_analysis', _('CV Analysis')
    INTERVIEW_SIMULATOR = 'interview_simulator', _('Interview Simulator')
    SYSTEM = 'system', _('System')
    SUPERVISION = 'supervision', _('Supervision')


class DigestFrequency(models.TextChoices):
    DAILY = 'DAILY', _('Daily')
    WEEKLY = 'WEEKLY', _('Weekly')
    MONTHLY = 'MONTHLY', _('Monthly')


RETRY_DELAYS_SECONDS = [60, 300, 1800, 21600, 86400]
MAX_DELIVERY_ATTEMPTS = len(RETRY_DELAYS_SECONDS) + 1

SUPPORTED_LANGUAGES = ('fr', 'en', 'ar')
DEFAULT_LANGUAGE = 'en'
