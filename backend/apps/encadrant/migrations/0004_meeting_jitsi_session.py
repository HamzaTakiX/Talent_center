import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('encadrant', '0003_supervision_meetings_extension'),
    ]

    operations = [
        migrations.AddField(
            model_name='meeting',
            name='session_uuid',
            field=models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AddField(
            model_name='meeting',
            name='jitsi_room_name',
            field=models.CharField(blank=True, db_index=True, max_length=128, null=True, unique=True),
        ),
    ]
