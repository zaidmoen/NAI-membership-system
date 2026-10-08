import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Student",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("full_name", models.CharField(max_length=150)),
                ("university_id", models.CharField(max_length=30, unique=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending_payment", "Pending Payment"),
                            ("active_member", "Active Member"),
                        ],
                        default="pending_payment",
                        max_length=20,
                    ),
                ),
                ("registered_at", models.DateTimeField(auto_now_add=True)),
                ("payment_confirmed_at", models.DateTimeField(blank=True, null=True)),
                (
                    "payment_confirmed_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="confirmed_memberships",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["full_name", "id"],
            },
        ),
    ]
