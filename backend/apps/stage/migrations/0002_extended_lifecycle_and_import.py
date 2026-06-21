# Generated manually for extended lifecycle, import, matching history, analytics

import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stage', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts_et_roles', '0005_student_internship_derived_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='internshipoffer',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='internshipoffer',
            name='opened_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='internshipoffer',
            name='reviewed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='internshipoffer',
            name='reviewed_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='reviewed_offers',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='internshipoffer',
            name='submitted_for_review_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='internshipoffer',
            name='status',
            field=models.CharField(
                choices=[
                    ('DRAFT', 'Draft'),
                    ('PENDING_REVIEW', 'Pending review'),
                    ('PUBLISHED', 'Published'),
                    ('OPEN', 'Open'),
                    ('CLOSED', 'Closed'),
                    ('EXPIRED', 'Expired'),
                    ('ARCHIVED', 'Archived'),
                    ('DELETED', 'Deleted'),
                ],
                db_index=True,
                default='DRAFT',
                max_length=16,
            ),
        ),
        migrations.AlterField(
            model_name='offerapplication',
            name='status',
            field=models.CharField(
                choices=[
                    ('SUBMITTED', 'Submitted'),
                    ('UNDER_REVIEW', 'Under review'),
                    ('SHORTLISTED', 'Shortlisted'),
                    ('INTERVIEW', 'Interview scheduled'),
                    ('ACCEPTED', 'Accepted'),
                    ('REJECTED', 'Rejected'),
                    ('WITHDRAWN', 'Withdrawn'),
                    ('EXPIRED', 'Expired'),
                    ('OFFER_ACCEPTED', 'Offer accepted'),
                    ('OFFER_DECLINED', 'Offer declined'),
                    ('INTERNSHIP_STARTED', 'Internship started'),
                    ('INTERNSHIP_COMPLETED', 'Internship completed'),
                ],
                db_index=True,
                default='SUBMITTED',
                max_length=16,
            ),
        ),
        migrations.CreateModel(
            name='OfferStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('previous_status', models.CharField(blank=True, default='', max_length=16)),
                ('new_status', models.CharField(db_index=True, max_length=16)),
                ('reason', models.TextField(blank=True, default='')),
                ('is_automated', models.BooleanField(db_index=True, default=False)),
                ('metadata_json', models.JSONField(blank=True, default=dict)),
                ('changed_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='+',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('offer', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='status_history',
                    to='stage.internshipoffer',
                )),
            ],
            options={
                'ordering': ['-created_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ApplicationStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('previous_status', models.CharField(blank=True, default='', max_length=24)),
                ('new_status', models.CharField(db_index=True, max_length=24)),
                ('reason', models.TextField(blank=True, default='')),
                ('is_automated', models.BooleanField(db_index=True, default=False)),
                ('metadata_json', models.JSONField(blank=True, default=dict)),
                ('application', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='status_history',
                    to='stage.offerapplication',
                )),
                ('changed_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='+',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['-created_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='OfferImportJob',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('source_url', models.URLField(max_length=1024)),
                ('detected_platform', models.CharField(
                    choices=[
                        ('LINKEDIN', 'LinkedIn'),
                        ('INDEED', 'Indeed'),
                        ('REKRUTE', 'Rekrute'),
                        ('EMPLOI_MA', 'Emploi.ma'),
                        ('COMPANY_WEBSITE', 'Company website'),
                        ('UNKNOWN', 'Unknown'),
                    ],
                    db_index=True,
                    default='UNKNOWN',
                    max_length=32,
                )),
                ('status', models.CharField(
                    choices=[
                        ('PENDING', 'Pending'),
                        ('VALIDATING', 'Validating URL'),
                        ('EXTRACTING', 'Extracting data'),
                        ('PREVIEW_READY', 'Preview ready'),
                        ('AWAITING_ADMIN', 'Awaiting admin validation'),
                        ('PUBLISHING', 'Publishing'),
                        ('COMPLETED', 'Completed'),
                        ('FAILED', 'Failed'),
                        ('CANCELLED', 'Cancelled'),
                    ],
                    db_index=True,
                    default='PENDING',
                    max_length=24,
                )),
                ('extracted_data', models.JSONField(blank=True, default=dict)),
                ('normalized_data', models.JSONField(blank=True, default=dict)),
                ('validation_errors', models.JSONField(blank=True, default=list)),
                ('error_message', models.TextField(blank=True, default='')),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('metadata_json', models.JSONField(blank=True, default=dict)),
                ('duplicate_offer', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='duplicate_import_jobs',
                    to='stage.internshipoffer',
                )),
                ('initiated_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='offer_import_jobs',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('resulting_offer', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='import_jobs',
                    to='stage.internshipoffer',
                )),
            ],
            options={
                'ordering': ['-created_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='OfferImportHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('step', models.CharField(
                    choices=[
                        ('URL_VALIDATED', 'URL validated'),
                        ('PLATFORM_DETECTED', 'Platform detected'),
                        ('DATA_EXTRACTED', 'Data extracted'),
                        ('DATA_NORMALIZED', 'Data normalized'),
                        ('PREVIEW_GENERATED', 'Preview generated'),
                        ('ADMIN_APPROVED', 'Admin approved'),
                        ('ADMIN_REJECTED', 'Admin rejected'),
                        ('OFFER_PUBLISHED', 'Offer published'),
                        ('FAILED', 'Failed'),
                    ],
                    db_index=True,
                    max_length=32,
                )),
                ('message', models.TextField(blank=True, default='')),
                ('payload_json', models.JSONField(blank=True, default=dict)),
                ('job', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='history',
                    to='stage.offerimportjob',
                )),
                ('performed_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='+',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'ordering': ['created_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='MatchingHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('previous_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('new_score', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('match_reasons', models.JSONField(blank=True, default=list)),
                ('trigger', models.CharField(
                    choices=[
                        ('MANUAL', 'Manual'),
                        ('SCHEDULED', 'Scheduled job'),
                        ('OFFER_PUBLISHED', 'Offer published'),
                        ('PROFILE_UPDATED', 'Student profile updated'),
                        ('APPLICATION', 'Application submitted'),
                    ],
                    db_index=True,
                    max_length=24,
                )),
                ('metadata_json', models.JSONField(blank=True, default=dict)),
                ('offer', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='matching_history',
                    to='stage.internshipoffer',
                )),
                ('student_profile', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='matching_history',
                    to='accounts_et_roles.studentprofile',
                )),
            ],
            options={
                'ordering': ['-created_at'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='OfferAnalyticsSnapshot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('snapshot_date', models.DateField(db_index=True)),
                ('period', models.CharField(db_index=True, default='daily', max_length=16)),
                ('metrics_json', models.JSONField(blank=True, default=dict)),
            ],
            options={
                'ordering': ['-snapshot_date'],
                'abstract': False,
            },
        ),
        migrations.AddIndex(
            model_name='offerstatushistory',
            index=models.Index(fields=['offer', '-created_at'], name='stage_offer_offer_s_idx'),
        ),
        migrations.AddIndex(
            model_name='offerstatushistory',
            index=models.Index(fields=['new_status', '-created_at'], name='stage_offer_new_st_idx'),
        ),
        migrations.AddIndex(
            model_name='applicationstatushistory',
            index=models.Index(fields=['application', '-created_at'], name='stage_appli_applica_s_idx'),
        ),
        migrations.AddIndex(
            model_name='applicationstatushistory',
            index=models.Index(fields=['new_status', '-created_at'], name='stage_appli_new_st_idx'),
        ),
        migrations.AddIndex(
            model_name='offerimportjob',
            index=models.Index(fields=['status', '-created_at'], name='stage_offer_status_i_idx'),
        ),
        migrations.AddIndex(
            model_name='offerimportjob',
            index=models.Index(fields=['detected_platform', '-created_at'], name='stage_offer_detecte_idx'),
        ),
        migrations.AddIndex(
            model_name='matchinghistory',
            index=models.Index(fields=['student_profile', '-created_at'], name='stage_match_student_idx'),
        ),
        migrations.AddIndex(
            model_name='matchinghistory',
            index=models.Index(fields=['offer', '-created_at'], name='stage_match_offer_idx'),
        ),
        migrations.AddIndex(
            model_name='matchinghistory',
            index=models.Index(fields=['trigger', '-created_at'], name='stage_match_trigger_idx'),
        ),
        migrations.AddConstraint(
            model_name='offeranalyticssnapshot',
            constraint=models.UniqueConstraint(
                fields=('snapshot_date', 'period'),
                name='uniq_offer_analytics_snapshot',
            ),
        ),
    ]
