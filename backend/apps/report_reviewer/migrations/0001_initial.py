# Generated manually for PageAnalysisCache

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='PageAnalysisCache',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_id', models.CharField(db_index=True, max_length=128)),
                ('page_number', models.PositiveIntegerField()),
                ('content_hash', models.CharField(db_index=True, max_length=64)),
                ('mode', models.CharField(default='full', max_length=32)),
                ('model_name', models.CharField(blank=True, default='', max_length=128)),
                ('score', models.PositiveSmallIntegerField(default=100)),
                ('issues_json', models.JSONField(default=list)),
                ('summary_json', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                (
                    'user',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='report_page_analyses',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='pageanalysiscache',
            constraint=models.UniqueConstraint(
                fields=('user', 'report_id', 'page_number', 'content_hash', 'mode'),
                name='uniq_page_analysis_cache',
            ),
        ),
        migrations.AddIndex(
            model_name='pageanalysiscache',
            index=models.Index(
                fields=['user', 'report_id', 'page_number', 'mode'],
                name='rpt_rev_user_rpt_page_mode_idx',
            ),
        ),
    ]
