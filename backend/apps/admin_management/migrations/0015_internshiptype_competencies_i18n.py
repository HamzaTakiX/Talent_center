from django.db import migrations


def _sync_competency_i18n(apps, schema_editor):
    from apps.admin_management.services.esca_internship_competencies import sync_internship_competencies

    sync_internship_competencies()


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0014_internshiptype_competencies'),
    ]

    operations = [
        migrations.RunPython(_sync_competency_i18n, migrations.RunPython.noop),
    ]
