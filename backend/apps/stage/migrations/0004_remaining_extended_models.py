# Remaining extended models — Company details, Interview details, Content history, Webhook logs

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stage', '0003_production_domains'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CompanyContact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('full_name', models.CharField(max_length=255)),
                ('email', models.EmailField(blank=True, default='', max_length=254)),
                ('phone', models.CharField(blank=True, default='', max_length=32)),
                ('job_title', models.CharField(blank=True, default='', max_length=128)),
                ('is_primary', models.BooleanField(db_index=True, default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contacts', to='stage.company')),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='CompanyStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('previous_status', models.CharField(blank=True, default='', max_length=24)),
                ('new_status', models.CharField(db_index=True, max_length=24)),
                ('reason', models.TextField(blank=True, default='')),
                ('is_automated', models.BooleanField(default=False)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='stage.company')),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='InterviewFeedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('overall_score', models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ('technical_score', models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ('communication_score', models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ('strengths', models.TextField(blank=True, default='')),
                ('weaknesses', models.TextField(blank=True, default='')),
                ('recommendation', models.CharField(blank=True, default='', max_length=32)),
                ('metadata_json', models.JSONField(blank=True, default=dict)),
                ('interview', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='feedbacks', to='stage.interview')),
                ('reviewer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='interview_feedbacks', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='InterviewResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('outcome', models.CharField(default='PENDING', max_length=16)),
                ('notes', models.TextField(blank=True, default='')),
                ('decided_at', models.DateTimeField(blank=True, null=True)),
                ('decided_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('interview', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='result', to='stage.interview')),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='OfferContentHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('field_name', models.CharField(db_index=True, max_length=64)),
                ('old_value', models.JSONField(blank=True, null=True)),
                ('new_value', models.JSONField(blank=True, null=True)),
                ('version_number', models.PositiveIntegerField(blank=True, null=True)),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('offer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='content_history', to='stage.internshipoffer')),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
        migrations.CreateModel(
            name='MatchingWeightConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(default='default', max_length=128)),
                ('weights_json', models.JSONField(default=dict)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-updated_at', '-created_at'], 'abstract': False},
        ),
    ]
