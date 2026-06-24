from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('announcements', '0002_announcementinternshipdetails_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='announcementpublicationlog',
            name='action',
            field=models.CharField(
                choices=[
                    ('CREATED', 'Created'),
                    ('UPDATED', 'Updated'),
                    ('SCHEDULED', 'Scheduled'),
                    ('SCHEDULE_MODIFIED', 'Schedule modified'),
                    ('SCHEDULE_CANCELLED', 'Schedule cancelled'),
                    ('PUBLISHED', 'Published'),
                    ('AUTO_PUBLISHED', 'Auto published'),
                    ('UNPUBLISHED', 'Unpublished'),
                    ('ARCHIVED', 'Archived'),
                    ('EXPIRED', 'Expired'),
                    ('HIDDEN', 'Hidden'),
                    ('DUPLICATED', 'Duplicated'),
                ],
                db_index=True,
                max_length=20,
            ),
        ),
    ]
