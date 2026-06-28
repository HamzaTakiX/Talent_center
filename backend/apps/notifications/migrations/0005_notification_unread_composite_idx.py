# Generated manually for performance — composite index for unread inbox queries.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0004_alter_emailcategoryconfig_category_and_more'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(
                fields=['recipient', 'is_archived', 'is_read'],
                name='notif_recip_arch_read_idx',
            ),
        ),
    ]
