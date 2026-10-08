from django.conf import settings
from django.db import models


class Student(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = "pending_payment", "Pending Payment"
        ACTIVE_MEMBER = "active_member", "Active Member"

    full_name = models.CharField(max_length=150)

    # Keep this as text so a university ID can start with zero
    university_id = models.CharField(max_length=30, unique=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING_PAYMENT,
    )
    registered_at = models.DateTimeField(auto_now_add=True)
    payment_confirmed_at = models.DateTimeField(null=True, blank=True)
    payment_confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="confirmed_memberships",
    )

    class Meta:
        ordering = ["full_name", "id"]

    def __str__(self):
        return f"{self.full_name} ({self.university_id})"
