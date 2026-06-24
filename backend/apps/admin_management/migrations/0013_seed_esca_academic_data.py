"""Run ESCA academic seed after bilingual name columns exist (0011)."""

from django.db import migrations


def _seed_esca_academic(apps, schema_editor):
    __import__(
        'apps.admin_management.services.esca_academic_seed',
        fromlist=['seed_esca_academic'],
    ).seed_esca_academic()


class Migration(migrations.Migration):
    dependencies = [
        ('admin_management', '0012_alter_academicstructureauditlog_action'),
    ]

    operations = [
        migrations.RunPython(_seed_esca_academic, migrations.RunPython.noop),
    ]
