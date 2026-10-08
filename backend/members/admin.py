from django.contrib import admin

from members.models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "university_id",
        "status",
        "registered_at",
        "payment_confirmed_at",
    )
    list_filter = ("status",)
    search_fields = ("full_name", "university_id")
    readonly_fields = ("registered_at", "payment_confirmed_at", "payment_confirmed_by")
