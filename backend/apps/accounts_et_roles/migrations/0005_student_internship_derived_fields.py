from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts_et_roles', '0004_esca_academic_hierarchy'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentprofile',
            name='internship_category',
            field=models.CharField(
                blank=True,
                db_index=True,
                default='',
                help_text='ESCA program family (PGE, LME, IBA, MASTER) for the resolved internship.',
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name='studentprofile',
            name='internship_duration',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Denormalized duration hint from the resolved internship type.',
                max_length=64,
            ),
        ),
        migrations.AlterField(
            model_name='studentprofile',
            name='internship_type',
            field=models.ForeignKey(
                blank=True,
                help_text='Auto-derived from program and level — not set manually by admins.',
                null=True,
                on_delete=models.SET_NULL,
                related_name='students',
                to='admin_management.internshiptype',
            ),
        ),
    ]
