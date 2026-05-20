from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0003_esca_academic_hierarchy'),
    ]

    operations = [
        migrations.AddField(
            model_name='encadrantprofile',
            name='scope_class_group_ids',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
