from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cv_intelligence', '0004_interviewsession_interviewtranscript_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='interviewsession',
            name='external_offer_url',
            field=models.URLField(blank=True, default='', max_length=2048),
        ),
    ]
