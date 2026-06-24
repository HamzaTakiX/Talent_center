# Generated manually for persistent CV analysis versioning

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cv_intelligence', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='cvintelligencereport',
            name='cv_hash',
            field=models.CharField(blank=True, db_index=True, default='', max_length=64),
        ),
        migrations.AddField(
            model_name='cvintelligencereport',
            name='version',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='cvintelligencereport',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddIndex(
            model_name='cvintelligencereport',
            index=models.Index(fields=['student_profile', 'is_active', '-analyzed_at'], name='cv_intel_stu_active_idx'),
        ),
        migrations.AddIndex(
            model_name='cvintelligencereport',
            index=models.Index(fields=['student_profile', 'cv_hash'], name='cv_intel_stu_hash_idx'),
        ),
    ]
