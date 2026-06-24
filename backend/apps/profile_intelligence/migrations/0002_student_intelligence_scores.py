# Generated manually for Student Intelligence Scoring System

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profile_intelligence', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentprofileindicator',
            name='employability_score',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='internship_readiness_score',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='profile_completion_score',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='interview_readiness_score',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='career_progress_score',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='placement_probability',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='risk_category',
            field=models.CharField(
                choices=[
                    ('LOW', 'Low Risk'),
                    ('MEDIUM', 'Medium Risk'),
                    ('HIGH', 'High Risk'),
                    ('CRITICAL', 'Critical Risk'),
                ],
                db_index=True,
                default='LOW',
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='engagement_category',
            field=models.CharField(
                choices=[
                    ('INACTIVE', 'Inactive'),
                    ('LOW', 'Low'),
                    ('ACTIVE', 'Active'),
                    ('HIGHLY_ENGAGED', 'Highly Engaged'),
                ],
                db_index=True,
                default='INACTIVE',
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='health_index',
            field=models.CharField(
                choices=[
                    ('HEALTHY', 'Healthy'),
                    ('NEEDS_ATTENTION', 'Needs Attention'),
                    ('AT_RISK', 'At Risk'),
                    ('CRITICAL', 'Critical'),
                ],
                db_index=True,
                default='NEEDS_ATTENTION',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='score_breakdown_json',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='studentprofileindicator',
            name='computed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='studentprofilesnapshot',
            name='employability_score',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofilesnapshot',
            name='internship_readiness_score',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofilesnapshot',
            name='interview_readiness_score',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofilesnapshot',
            name='career_progress_score',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofilesnapshot',
            name='placement_probability',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='studentprofilesnapshot',
            name='health_index',
            field=models.CharField(
                choices=[
                    ('HEALTHY', 'Healthy'),
                    ('NEEDS_ATTENTION', 'Needs Attention'),
                    ('AT_RISK', 'At Risk'),
                    ('CRITICAL', 'Critical'),
                ],
                default='NEEDS_ATTENTION',
                max_length=20,
            ),
        ),
        migrations.AddIndex(
            model_name='studentprofileindicator',
            index=models.Index(fields=['health_index', '-computed_at'], name='profile_int_health_idx'),
        ),
        migrations.AddIndex(
            model_name='studentprofileindicator',
            index=models.Index(fields=['risk_category', '-risk_score'], name='profile_int_risk_cat_idx'),
        ),
    ]
