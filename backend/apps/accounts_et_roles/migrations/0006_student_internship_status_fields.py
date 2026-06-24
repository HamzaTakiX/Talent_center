from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts_et_roles', '0005_student_internship_derived_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentprofile',
            name='has_internship',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='studentprofile',
            name='internship_status_acknowledged',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='studentprofile',
            name='internship_company_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='studentprofile',
            name='internship_specialization',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='studentprofile',
            name='internship_company_city',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='studentprofile',
            name='internship_stage_duration',
            field=models.CharField(blank=True, default='', max_length=64),
        ),
    ]
