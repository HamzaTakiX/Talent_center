from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminprofile',
            name='extra_permission_codes',
            field=models.JSONField(blank=True, default=list, help_text='Granular permission codes granted beyond role bundles.'),
        ),
        migrations.AddField(
            model_name='adminprofile',
            name='scope_levels',
            field=models.JSONField(blank=True, default=list, help_text='Academic levels this admin may operate on (e.g. L1, M2).'),
        ),
        migrations.AddField(
            model_name='adminprofile',
            name='scope_academic_years',
            field=models.JSONField(blank=True, default=list, help_text='Academic years this admin may operate on (e.g. 2025-2026).'),
        ),
    ]
