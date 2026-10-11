from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("members", "0003_student_payment_confirmed_by_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="is_volunteer",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="student",
            name="volunteer_committee",
            field=models.CharField(
                blank=True,
                choices=[
                    ("public_relations", "العلاقات العامة"),
                    ("activities", "الأنشطة"),
                    ("technical", "اللجنة التقنية"),
                    ("media", "اللجنة الإعلامية"),
                    ("ai_activities", "أنشطة الذكاء الاصطناعي المتخصصة"),
                ],
                default="",
                max_length=30,
            ),
        ),
    ]
