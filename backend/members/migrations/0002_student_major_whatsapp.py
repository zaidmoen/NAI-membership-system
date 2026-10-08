from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("members", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="major",
            field=models.CharField(default="", max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="student",
            name="whatsapp",
            field=models.CharField(default="", max_length=25),
            preserve_default=False,
        ),
    ]
