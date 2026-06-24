from django.db import models


class CvSourceType(models.TextChoices):
    BUILDER = 'builder', 'CV Builder'
    PDF = 'pdf', 'PDF Upload'
    DOCX = 'docx', 'DOCX Upload'
    PROFILE_FILE = 'profile_file', 'Profile CV File'


class AnalysisStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    RUNNING = 'running', 'Running'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'


SCORE_WEIGHTS = {
    'skills': 0.25,
    'experience': 0.20,
    'education': 0.15,
    'formatting': 0.10,
    'ats': 0.15,
    'readiness': 0.15,
}

STRUCTURED_CV_FIELDS = (
    'name',
    'email',
    'phone',
    'linkedin',
    'github',
    'portfolio',
    'languages',
    'education',
    'experience',
    'projects',
    'certifications',
    'skills',
    'achievements',
    'internship_history',
    'professional_summary',
)
