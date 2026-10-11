from django.urls import path

from members.views import (
    ConfirmPaymentView,
    MembershipSummaryView,
    StudentExportView,
    StudentListView,
    StudentRegistrationView,
    health_check,
)

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("students/register/", StudentRegistrationView.as_view(), name="student-registration"),
    path("students/summary/", MembershipSummaryView.as_view(), name="membership-summary"),
    path("students/export/", StudentExportView.as_view(), name="student-export"),
    path("students/", StudentListView.as_view(), name="student-list"),
    path(
        "students/<int:student_id>/confirm-payment/",
        ConfirmPaymentView.as_view(),
        name="confirm-payment",
    ),
]

