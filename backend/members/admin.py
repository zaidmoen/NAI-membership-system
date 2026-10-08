from django.contrib import admin

from members.models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "major",
        "university_id",
        "whatsapp",
        "status",
        "registered_at",
        "payment_confirmed_at",
    )
    list_filter = ("status",)
    search_fields = ("full_name", "major", "university_id", "whatsapp")
    readonly_fields = (
        "full_name",
        "major",
        "university_id",
        "whatsapp",
        "status",
        "registered_at",
        "payment_confirmed_at",
        "payment_confirmed_by",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
