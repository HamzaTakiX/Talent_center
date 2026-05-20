from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0007_assignment_cases'),
    ]

    operations = [
        migrations.AddField(
            model_name='encadrantprofile',
            name='supervised_internship_types',
            field=models.ManyToManyField(
                blank=True,
                help_text='Internship/stage types this encadrant is allowed to supervise.',
                related_name='supervising_encadrants',
                to='admin_management.internshiptype',
            ),
        ),
    ]
