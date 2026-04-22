from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('cv_builder', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CvShareLink',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('token', models.CharField(editable=False, max_length=48, unique=True)),
                ('label', models.CharField(blank=True, default='', max_length=128)),
                ('is_active', models.BooleanField(default=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
                ('view_count', models.PositiveIntegerField(default=0)),
                ('last_viewed_at', models.DateTimeField(blank=True, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True,
                                                   on_delete=django.db.models.deletion.SET_NULL,
                                                   related_name='+',
                                                   to=settings.AUTH_USER_MODEL)),
                ('student_cv', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                                                   related_name='share_links',
                                                   to='cv_builder.studentcv')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='cvsharelink',
            index=models.Index(fields=['student_cv', 'is_active'],
                                name='cv_builder__student_share_idx'),
        ),
    ]
