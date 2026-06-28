from decimal import Decimal

from django.db import migrations, models


def backfill_installment_paid_amount(apps, schema_editor):
    Installment = apps.get_model('srf', 'Installment')
    for inst in Installment.objects.filter(payment_status='PAID'):
        inst.paid_amount = inst.amount
        inst.save(update_fields=['paid_amount'])


class Migration(migrations.Migration):

    dependencies = [
        ('srf', '0005_installment_plan_templates'),
    ]

    operations = [
        migrations.AddField(
            model_name='installment',
            name='paid_amount',
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal('0'),
                help_text='Cumulative amount validated for this installment.',
                max_digits=12,
            ),
        ),
        migrations.RunPython(backfill_installment_paid_amount, migrations.RunPython.noop),
    ]
