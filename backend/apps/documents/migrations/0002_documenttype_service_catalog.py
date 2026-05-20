from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='documenttype',
            name='icon_key',
            field=models.CharField(blank=True, default='file-text', max_length=48),
        ),
        migrations.AddField(
            model_name='documenttype',
            name='color_theme',
            field=models.CharField(blank=True, default='brand', max_length=32),
        ),
        migrations.AddField(
            model_name='documenttype',
            name='service_config_json',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
