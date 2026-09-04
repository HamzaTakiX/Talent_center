from django.db import migrations, models


def _link_filiere_domains(apps, schema_editor):
    Filiere = apps.get_model('admin_management', 'Filiere')
    SpecializationDomain = apps.get_model('admin_management', 'SpecializationDomain')

    filieres = list(
        Filiere.objects.filter(is_active=True, is_archived=False).exclude(program_family=''),
    )
    if not filieres:
        return

    # ESCA programs are business-focused: only auto-link BUSINESS domains.
    domains = list(
        SpecializationDomain.objects.filter(is_active=True, category='BUSINESS'),
    )
    if not domains:
        return

    for filiere in filieres:
        family = (filiere.program_family or '').upper()
        linked = []
        for domain in domains:
            families = [str(f).upper() for f in (domain.program_families or [])]
            if families and family in families:
                linked.append(domain)
        if linked:
            filiere.specialization_domains.set(linked)


class Migration(migrations.Migration):

    dependencies = [
        ('admin_management', '0015_internshiptype_competencies_i18n'),
    ]

    operations = [
        migrations.AddField(
            model_name='filiere',
            name='specialization_domains',
            field=models.ManyToManyField(
                blank=True,
                help_text=(
                    'Business and technical domains configured for this program '
                    '(Structure académique → Filière). Source of truth for encadrant forms.'
                ),
                related_name='filieres',
                to='admin_management.specializationdomain',
            ),
        ),
        migrations.RunPython(_link_filiere_domains, migrations.RunPython.noop),
    ]
