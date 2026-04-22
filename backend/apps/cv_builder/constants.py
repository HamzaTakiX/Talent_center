"""
Enum/choice constants used across cv_builder models and services.

Keeping these in a dedicated module (rather than inline in models.py)
means services, serializers, and seed data can import them without
creating a circular dependency with the Django app registry.
"""

from django.db import models


class CvStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    READY = 'ready', 'Ready'
    ARCHIVED = 'archived', 'Archived'


class SectionType(models.TextChoices):
    HEADER = 'header', 'Header'
    CONTACT = 'contact', 'Contact'
    SUMMARY = 'summary', 'Profile Summary'
    EDUCATION = 'education', 'Education'
    EXPERIENCE = 'experience', 'Experience'
    SKILLS = 'skills', 'Skills'
    LANGUAGES = 'languages', 'Languages'
    PROJECTS = 'projects', 'Projects'
    CERTIFICATIONS = 'certifications', 'Certifications'
    CUSTOM = 'custom', 'Custom'


class AssetType(models.TextChoices):
    PROFILE_IMAGE = 'profile_image', 'Profile Image'
    ATTACHMENT = 'attachment', 'Attachment'


class TemplateCategory(models.TextChoices):
    MODERN = 'modern', 'Modern'
    CLASSIC = 'classic', 'Classic'
    MINIMAL = 'minimal', 'Minimal'
    CREATIVE = 'creative', 'Creative'


# Template slot names — used by template layout_schema to declare
# where a given section_type should render. Stored on CvSection.slot_name.
class TemplateSlot:
    MAIN = 'main'
    LEFT = 'left'
    RIGHT = 'right'
    HEADER = 'header'
