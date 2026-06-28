from django.db import migrations, models


def _seed_competencies(apps, schema_editor):
    from apps.admin_management.services.esca_academic_seed import seed_esca_academic

    seed_esca_academic()


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0013_seed_esca_academic_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='internshiptype',
            name='competencies',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Program-specific competencies for this internship type (list of i18n objects).',
            ),
        ),
        migrations.RunPython(_seed_competencies, migrations.RunPython.noop),
    ]
