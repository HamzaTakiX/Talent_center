"""Add name_fr / name_en columns and backfill from name_i18n."""

from django.db import migrations, models


def _backfill_bilingual_names(apps, schema_editor):
    models_with_i18n = (
        'Filiere',
        'AcademicLevel',
        'AcademicSector',
        'InternshipType',
        'WorkMode',
        'SpecializationDomain',
    )
    for model_name in models_with_i18n:
        Model = apps.get_model('admin_management', model_name)
        for obj in Model.objects.all().iterator():
            i18n = obj.name_i18n or {}
            name_fr = (getattr(obj, 'name_fr', '') or '').strip() or str(i18n.get('fr') or '').strip()
            name_en = (
                (getattr(obj, 'name_en', '') or '').strip()
                or str(i18n.get('en') or '').strip()
                or (obj.name or '').strip()
            )
            obj.name_fr = name_fr
            obj.name_en = name_en
            obj.save(update_fields=['name_fr', 'name_en'])

    ClassGroup = apps.get_model('admin_management', 'ClassGroup')
    for obj in ClassGroup.objects.all().iterator():
        canonical = (obj.name or '').strip()
        obj.name_fr = (getattr(obj, 'name_fr', '') or '').strip() or canonical
        obj.name_en = (getattr(obj, 'name_en', '') or '').strip() or canonical
        obj.save(update_fields=['name_fr', 'name_en'])


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0010_academic_structure_management'),
    ]

    operations = [
        migrations.AddField(
            model_name='filiere',
            name='name_fr',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='filiere',
            name='name_en',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='academiclevel',
            name='name_fr',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='academiclevel',
            name='name_en',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='academicsector',
            name='name_fr',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='academicsector',
            name='name_en',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='internshiptype',
            name='name_fr',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='internshiptype',
            name='name_en',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='workmode',
            name='name_fr',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
        migrations.AddField(
            model_name='workmode',
            name='name_en',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
        migrations.AddField(
            model_name='classgroup',
            name='name_fr',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='classgroup',
            name='name_en',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='specializationdomain',
            name='name_fr',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='specializationdomain',
            name='name_en',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.RunPython(_backfill_bilingual_names, migrations.RunPython.noop),
    ]
