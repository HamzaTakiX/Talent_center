# Generated manually for ERMS extension

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def migrate_legacy_report_data(apps, schema_editor):
    Report = apps.get_model('encadrant', 'Report')
    type_map = {
        'PROGRESS': 'FOLLOW_UP',
        'EVALUATION': 'PERFORMANCE',
        'INTERIM': 'MID_TERM',
        'INCIDENT': 'RISK_ALERT',
    }
    for report in Report.objects.all():
        if report.report_type in type_map:
            report.report_type = type_map[report.report_type]
        if report.status == 'REVIEWED':
            report.status = 'UNDER_REVIEW'
        report.save(update_fields=['report_type', 'status'])


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ('admin_management', '0008_encadrant_supervised_internship_types'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('encadrant', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='assignment',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='supervision_reports',
                to='admin_management.assignment',
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='severity',
            field=models.CharField(
                choices=[
                    ('INFO', 'Info'),
                    ('LOW', 'Low'),
                    ('MEDIUM', 'Medium'),
                    ('HIGH', 'High'),
                    ('CRITICAL', 'Critical'),
                ],
                db_index=True,
                default='INFO',
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='priority_score',
            field=models.PositiveIntegerField(db_index=True, default=0),
        ),
        migrations.AddField(
            model_name='report',
            name='is_overdue',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name='report',
            name='due_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='assigned_reviewer',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_supervision_reports',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='escalated_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='escalated_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='escalated_supervision_reports',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='archived_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='archived_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='archived_supervision_reports',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='comments',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='report',
            name='evaluation_json',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='report',
            name='filiere',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='supervision_reports',
                to='admin_management.filiere',
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='academic_level',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='supervision_reports',
                to='admin_management.academiclevel',
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='academic_sector',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='supervision_reports',
                to='admin_management.academicsector',
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='class_group',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='supervision_reports',
                to='admin_management.classgroup',
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='academic_year',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='supervision_reports',
                to='admin_management.academicyear',
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='internship_type',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='supervision_reports',
                to='admin_management.internshiptype',
            ),
        ),
        migrations.AddField(
            model_name='report',
            name='company_name',
            field=models.CharField(blank=True, db_index=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='report',
            name='company_city',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
        migrations.AddField(
            model_name='report',
            name='internship_period_start',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='report',
            name='internship_period_end',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='report',
            name='report_type',
            field=models.CharField(
                choices=[
                    ('FOLLOW_UP', 'Follow-up report'),
                    ('MID_TERM', 'Mid-term evaluation'),
                    ('FINAL', 'Final evaluation'),
                    ('RISK_ALERT', 'Risk alert'),
                    ('ATTENDANCE', 'Attendance issue'),
                    ('VALIDATION', 'Internship validation'),
                    ('COMPANY_ISSUE', 'Company problem'),
                    ('RECOMMENDATION', 'Recommendation'),
                    ('PERFORMANCE', 'Student performance'),
                    ('PROGRESS', 'Progress (legacy)'),
                    ('EVALUATION', 'Evaluation (legacy)'),
                    ('INTERIM', 'Interim (legacy)'),
                    ('INCIDENT', 'Incident (legacy)'),
                ],
                db_index=True,
                default='FOLLOW_UP',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='report',
            name='status',
            field=models.CharField(
                choices=[
                    ('DRAFT', 'Draft'),
                    ('SUBMITTED', 'Submitted'),
                    ('UNDER_REVIEW', 'Under review'),
                    ('REQUIRES_CHANGES', 'Requires changes'),
                    ('RESUBMITTED', 'Resubmitted'),
                    ('ESCALATED', 'Escalated'),
                    ('CRITICAL_REVIEW', 'Critical review'),
                    ('APPROVED', 'Approved'),
                    ('REJECTED', 'Rejected'),
                    ('ARCHIVED', 'Archived'),
                    ('REVIEWED', 'Reviewed (legacy)'),
                ],
                db_index=True,
                default='DRAFT',
                max_length=20,
            ),
        ),
        migrations.AlterModelOptions(
            name='report',
            options={'ordering': ['-priority_score', '-submitted_at', '-created_at']},
        ),
        migrations.CreateModel(
            name='ReportAttachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('file', models.FileField(upload_to='supervision_reports/%Y/%m/')),
                ('original_name', models.CharField(blank=True, default='', max_length=255)),
                ('mime_type', models.CharField(blank=True, default='', max_length=128)),
                ('size_bytes', models.PositiveIntegerField(default=0)),
                ('report', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='encadrant.report')),
                ('uploaded_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='ReportWorkflowEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('CREATED', 'Created'), ('UPDATED', 'Updated'), ('SUBMITTED', 'Submitted'), ('RESUBMITTED', 'Resubmitted'), ('ASSIGNED_REVIEWER', 'Reviewer assigned'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected'), ('REQUESTED_CHANGES', 'Changes requested'), ('ESCALATED', 'Escalated'), ('ARCHIVED', 'Archived'), ('NOTE_ADDED', 'Note added'), ('NOTIFIED', 'Notified'), ('PRIORITY_RECALCULATED', 'Priority recalculated')], db_index=True, max_length=32)),
                ('from_status', models.CharField(blank=True, default='', max_length=20)),
                ('to_status', models.CharField(blank=True, default='', max_length=20)),
                ('note', models.TextField(blank=True, default='')),
                ('payload_json', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('report', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workflow_events', to='encadrant.report')),
            ],
            options={'ordering': ['created_at']},
        ),
        migrations.CreateModel(
            name='ReportComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('body', models.TextField()),
                ('is_internal', models.BooleanField(default=True)),
                ('author', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='supervision_report_comments', to=settings.AUTH_USER_MODEL)),
                ('report', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='admin_comments', to='encadrant.report')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='ReportTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('code', models.SlugField(max_length=64, unique=True)),
                ('name', models.CharField(max_length=255)),
                ('report_type', models.CharField(choices=[('FOLLOW_UP', 'Follow-up report'), ('MID_TERM', 'Mid-term evaluation'), ('FINAL', 'Final evaluation'), ('RISK_ALERT', 'Risk alert'), ('ATTENDANCE', 'Attendance issue'), ('VALIDATION', 'Internship validation'), ('COMPANY_ISSUE', 'Company problem'), ('RECOMMENDATION', 'Recommendation'), ('PERFORMANCE', 'Student performance'), ('PROGRESS', 'Progress (legacy)'), ('EVALUATION', 'Evaluation (legacy)'), ('INTERIM', 'Interim (legacy)'), ('INCIDENT', 'Incident (legacy)')], db_index=True, max_length=20)),
                ('schema_json', models.JSONField(blank=True, default=dict)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('internship_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='report_templates', to='admin_management.internshiptype')),
            ],
            options={'ordering': ['report_type', 'code']},
        ),
        migrations.CreateModel(
            name='ReportObligation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('report_type', models.CharField(choices=[('FOLLOW_UP', 'Follow-up report'), ('MID_TERM', 'Mid-term evaluation'), ('FINAL', 'Final evaluation'), ('RISK_ALERT', 'Risk alert'), ('ATTENDANCE', 'Attendance issue'), ('VALIDATION', 'Internship validation'), ('COMPANY_ISSUE', 'Company problem'), ('RECOMMENDATION', 'Recommendation'), ('PERFORMANCE', 'Student performance'), ('PROGRESS', 'Progress (legacy)'), ('EVALUATION', 'Evaluation (legacy)'), ('INTERIM', 'Interim (legacy)'), ('INCIDENT', 'Incident (legacy)')], db_index=True, max_length=20)),
                ('due_at', models.DateTimeField(db_index=True)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('SATISFIED', 'Satisfied'), ('OVERDUE', 'Overdue'), ('WAIVED', 'Waived')], db_index=True, default='PENDING', max_length=16)),
                ('reminder_sent_at', models.DateTimeField(blank=True, null=True)),
                ('metadata_json', models.JSONField(blank=True, default=dict)),
                ('academic_year', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='report_obligations', to='admin_management.academicyear')),
                ('assignment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='report_obligations', to='admin_management.assignment')),
                ('encadrant_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='report_obligations', to='admin_management.encadrantprofile')),
                ('satisfied_by_report', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='satisfied_obligations', to='encadrant.report')),
                ('student_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='report_obligations', to='accounts_et_roles.studentprofile')),
            ],
            options={'ordering': ['due_at']},
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['status', '-priority_score'], name='encadrant_r_status__8e0f0d_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['severity', '-priority_score'], name='encadrant_r_severit_2a8c8a_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['filiere', 'status'], name='encadrant_r_filiere_9c4e2a_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['is_overdue', '-due_at'], name='encadrant_r_is_over_7f3b2c_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['report_type', 'status'], name='encadrant_r_report__4d1e5f_idx'),
        ),
        migrations.AddIndex(
            model_name='reportworkflowevent',
            index=models.Index(fields=['report', 'created_at'], name='encadrant_r_report__1a2b3c_idx'),
        ),
        migrations.AddIndex(
            model_name='reportobligation',
            index=models.Index(fields=['encadrant_profile', 'status', 'due_at'], name='encadrant_r_encadra_5d6e7f_idx'),
        ),
        migrations.AddIndex(
            model_name='reportobligation',
            index=models.Index(fields=['student_profile', 'status'], name='encadrant_r_student_8g9h0i_idx'),
        ),
        migrations.RunPython(migrate_legacy_report_data, migrations.RunPython.noop),
    ]
