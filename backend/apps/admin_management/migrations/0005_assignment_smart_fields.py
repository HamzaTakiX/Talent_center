from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0004_encadrant_scope_class_groups'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignment',
            name='assignment_source',
            field=models.CharField(
                choices=[
                    ('LEGACY', 'Legacy'),
                    ('AUTO', 'Automatic'),
                    ('MANUAL', 'Manual'),
                ],
                db_index=True,
                default='LEGACY',
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name='assignment',
            name='is_locked',
            field=models.BooleanField(
                db_index=True,
                default=False,
                help_text='When locked, automatic reassignment skips this row.',
            ),
        ),
        migrations.AddField(
            model_name='assignment',
            name='match_score',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Smart assignment compatibility score (0–100).',
                max_digits=6,
                null=True,
            ),
        ),
        migrations.AddIndex(
            model_name='assignment',
            index=models.Index(fields=['is_locked', 'is_active'], name='admin_manag_is_lock_8a1f2c_idx'),
        ),
    ]
