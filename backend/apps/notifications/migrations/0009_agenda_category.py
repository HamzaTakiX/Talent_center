"""Add the AGENDA notification category.

The RenameIndex operations are pre-existing drift between the model Meta
indexes and the names fixed in migration history; they are reversible and are
folded in here so `makemigrations --check` stays clean.
"""

from django.db import migrations, models

CATEGORY_CHOICES = [
    ('offers', 'Offers'),
    ('applications', 'Applications'),
    ('documents', 'Documents'),
    ('announcements', 'Announcements'),
    ('chat', 'Chat'),
    ('srf', 'SRF'),
    ('cv_analysis', 'CV Analysis'),
    ('interview_simulator', 'Interview Simulator'),
    ('career_coach', 'Career Coach'),
    ('system', 'System'),
    ('supervision', 'Supervision'),
    ('agenda', 'Agenda'),
]


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0008_seed_dedicated_email_templates'),
    ]

    operations = [
        migrations.RenameIndex(
            model_name='notificationtemplate',
            new_name='notificatio_event_c_83598a_idx',
            old_name='notif_tpl_event_ch_st_idx',
        ),
        migrations.RenameIndex(
            model_name='notificationtemplate',
            new_name='notificatio_event_c_59bf3c_idx',
            old_name='notif_tpl_event_sel_idx',
        ),
        migrations.RenameIndex(
            model_name='notificationtemplate',
            new_name='notificatio_event_c_ce443d_idx',
            old_name='notif_tpl_event_def_idx',
        ),
        migrations.AlterField(
            model_name='emailcategoryconfig',
            name='category',
            field=models.CharField(choices=CATEGORY_CHOICES, max_length=32, unique=True),
        ),
        migrations.AlterField(
            model_name='notificationpreference',
            name='category',
            field=models.CharField(
                choices=CATEGORY_CHOICES, db_index=True, default='system', max_length=32,
            ),
        ),
        migrations.AlterField(
            model_name='notificationtemplate',
            name='category',
            field=models.CharField(choices=CATEGORY_CHOICES, db_index=True, max_length=32),
        ),
    ]
