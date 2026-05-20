from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('history', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='historyevent',
            name='actor_role',
            field=models.CharField(blank=True, db_index=True, default='', max_length=32),
        ),
        migrations.AddField(
            model_name='historyevent',
            name='summary',
            field=models.CharField(blank=True, db_index=True, default='', max_length=512),
        ),
        migrations.AddField(
            model_name='historyevent',
            name='is_automated',
            field=models.BooleanField(db_index=True, default=False),
        ),
        migrations.AddField(
            model_name='historyevent',
            name='visibility_scope',
            field=models.CharField(
                blank=True,
                db_index=True,
                default='platform',
                help_text='platform | scoped | self — RBAC visibility hint',
                max_length=32,
            ),
        ),
    ]
