from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("members", "0002_student_major_whatsapp"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="payment_confirmed_by_name",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
    ]
