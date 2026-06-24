from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('career_coach', '0004_rename_ai_coach_sess_user_arch_upd_idx_ai_coach_se_user_id_37c5df_idx'),
    ]

    operations = [
        migrations.AddField(
            model_name='aicoachsession',
            name='chat_summary',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name='aicoachsession',
            name='chat_summary_message_count',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
