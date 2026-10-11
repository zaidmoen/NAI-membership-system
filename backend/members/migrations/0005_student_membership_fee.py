from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("members", "0004_student_volunteer_details"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="membership_fee",
            field=models.PositiveSmallIntegerField(default=20),
        ),
    ]
