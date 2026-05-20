from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0005_assignment_smart_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='SpecializationDomain',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('code', models.SlugField(max_length=64, unique=True)),
                ('name', models.CharField(max_length=255)),
                ('name_i18n', models.JSONField(blank=True, default=dict)),
                ('category', models.CharField(
                    choices=[('BUSINESS', 'Business & management'), ('TECH', 'Technology & IT')],
                    db_index=True,
                    default='BUSINESS',
                    max_length=16,
                )),
                ('program_families', models.JSONField(blank=True, default=list)),
                ('master_tracks', models.JSONField(blank=True, default=list)),
                ('keywords', models.JSONField(blank=True, default=list)),
                ('sort_order', models.PositiveSmallIntegerField(default=0)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
            ],
            options={
                'verbose_name': 'Specialization domain',
                'verbose_name_plural': 'Specialization domains',
                'ordering': ['category', 'sort_order', 'name'],
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='encadrantprofile',
            name='specialization_domains',
            field=models.ManyToManyField(
                blank=True,
                help_text='Professional expertise domains for intelligent assignment.',
                related_name='encadrants',
                to='admin_management.specializationdomain',
            ),
        ),
        migrations.AlterField(
            model_name='encadrantprofile',
            name='expertise_areas',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='Denormalized domain codes synced from specialization_domains M2M.',
            ),
        ),
    ]
