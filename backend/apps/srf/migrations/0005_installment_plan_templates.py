from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0009_compliance_and_access'),
        ('srf', '0004_srf_operations_config'),
    ]

    operations = [
        migrations.AddField(
            model_name='srfrestrictionpolicy',
            name='exam_gate_mode',
            field=models.CharField(
                choices=[
                    ('FULL_CLEARANCE', 'Full clearance — entire year must be paid'),
                    ('DUE_TRANCHES', 'Due tranches — only tranches due before the exam must be paid'),
                ],
                default='DUE_TRANCHES',
                help_text=(
                    'Rule used to grant exam access for installment-plan students. '
                    'DUE_TRANCHES lets a student sit exams once the tranches due on or before '
                    'the exam date are paid, even if the full year is not yet settled.'
                ),
                max_length=16,
            ),
        ),
        migrations.CreateModel(
            name='SrfInstallmentPlanTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True, default='')),
                ('number_of_tranches', models.PositiveSmallIntegerField(default=3, help_text='How many installments the yearly total is split into (usually 3 or 4).')),
                ('split_mode', models.CharField(choices=[('EQUAL', 'Equal split'), ('CUSTOM', 'Custom percentages')], default='EQUAL', max_length=16)),
                ('currency', models.CharField(default='MAD', max_length=8)),
                ('is_mandatory', models.BooleanField(default=True, help_text='When true, students in scope must follow this installment plan.')),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('notes', models.TextField(blank=True, default='')),
                ('academic_level', models.ForeignKey(blank=True, help_text='Optional — when empty, applies to all levels in the program.', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='srf_installment_templates', to='admin_management.academiclevel')),
                ('academic_year', models.ForeignKey(blank=True, help_text='Optional — when empty, applies to every academic year.', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='srf_installment_templates', to='admin_management.academicyear')),
                ('filiere', models.ForeignKey(blank=True, help_text='Optional — when empty, the template applies to every program.', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='srf_installment_templates', to='admin_management.filiere')),
            ],
            options={
                'verbose_name': 'SRF installment plan template',
                'ordering': ['filiere', '-is_active', 'name'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SrfInstallmentPlanTranche',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('tranche_number', models.PositiveSmallIntegerField(db_index=True)),
                ('label', models.CharField(help_text='e.g. Tranche 1', max_length=64)),
                ('percentage', models.DecimalField(decimal_places=2, default=0, help_text='Share of the yearly total for this tranche (used for custom splits).', max_digits=5)),
                ('due_date', models.DateField(help_text='Deadline by which this tranche must be paid.')),
                ('semester', models.PositiveSmallIntegerField(default=1)),
                ('template', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tranches', to='srf.srfinstallmentplantemplate')),
            ],
            options={
                'ordering': ['template', 'tranche_number'],
                'abstract': False,
            },
        ),
        migrations.AddConstraint(
            model_name='srfinstallmentplantranche',
            constraint=models.UniqueConstraint(fields=('template', 'tranche_number'), name='uniq_tranche_per_template'),
        ),
    ]
