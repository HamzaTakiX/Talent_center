from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stage', '0004_remaining_extended_models'),
    ]

    operations = [
        migrations.AlterField(
            model_name='offerapplication',
            name='status',
            field=models.CharField(
                choices=[
                    ('SUBMITTED', 'Submitted'),
                    ('UNDER_REVIEW', 'Under review'),
                    ('SHORTLISTED', 'Shortlisted'),
                    ('INTERVIEW', 'Interview scheduled'),
                    ('ACCEPTED', 'Accepted'),
                    ('REJECTED', 'Rejected'),
                    ('WITHDRAWN', 'Withdrawn'),
                    ('EXPIRED', 'Expired'),
                    ('OFFER_ACCEPTED', 'Offer accepted'),
                    ('OFFER_DECLINED', 'Offer declined'),
                    ('INTERNSHIP_STARTED', 'Internship started'),
                    ('INTERNSHIP_COMPLETED', 'Internship completed'),
                ],
                db_index=True,
                default='SUBMITTED',
                max_length=24,
            ),
        ),
    ]
