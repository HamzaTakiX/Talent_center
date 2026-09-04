from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('career_coach', '0005_aicoachsession_chat_summary'),
    ]

    operations = [
        migrations.CreateModel(
            name='RagChunk',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('student_id', models.IntegerField(db_index=True)),
                ('chunk_id', models.CharField(max_length=128)),
                ('text', models.TextField()),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('embedding', models.JSONField(blank=True, default=list)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'career_coach_rag_chunks',
            },
        ),
        migrations.AddConstraint(
            model_name='ragchunk',
            constraint=models.UniqueConstraint(
                fields=('student_id', 'chunk_id'),
                name='career_coach_rag_student_chunk_uniq',
            ),
        ),
    ]
