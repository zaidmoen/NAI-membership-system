from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from members.models import Student


class StudentRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.registration_url = reverse("student-registration")

    def test_student_can_register_with_name_and_university_id(self):
        response = self.client.post(
            self.registration_url,
            {
                "full_name": "  Lina Khalil  ",
                "university_id": "0012345",
            },
            format="json",
        )

        student = Student.objects.get(university_id="0012345")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(student.full_name, "Lina Khalil")
        self.assertEqual(student.status, Student.Status.PENDING_PAYMENT)
        self.assertEqual(response.data["status"], Student.Status.PENDING_PAYMENT)

    def test_duplicate_university_id_is_rejected(self):
        Student.objects.create(
            full_name="Lina Khalil",
            university_id="0012345",
        )

        response = self.client.post(
            self.registration_url,
            {
                "full_name": "Another Student",
                "university_id": "0012345",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Student.objects.count(), 1)
        self.assertIn("university_id", response.data)

    def test_empty_name_is_rejected(self):
        response = self.client.post(
            self.registration_url,
            {"full_name": "   ", "university_id": "0012345"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Student.objects.count(), 0)


class AdminStudentApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = get_user_model().objects.create_user(
            username="nai-admin",
            password="test-password",
            is_staff=True,
        )

    def test_student_list_requires_admin_access(self):
        response = self.client.get(reverse("student-list"))

        self.assertEqual(response.status_code, 403)

    def test_admin_can_search_by_university_id(self):
        Student.objects.create(full_name="Lina Khalil", university_id="10001")
        Student.objects.create(full_name="Omar Saleh", university_id="10002")
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("student-list"), {"search": "10002"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["full_name"], "Omar Saleh")

    def test_admin_can_filter_by_status(self):
        Student.objects.create(full_name="Lina Khalil", university_id="10001")
        Student.objects.create(
            full_name="Omar Saleh",
            university_id="10002",
            status=Student.Status.ACTIVE_MEMBER,
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(
            reverse("student-list"),
            {"status": Student.Status.PENDING_PAYMENT},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["university_id"], "10001")

    def test_admin_can_confirm_payment_once(self):
        student = Student.objects.create(
            full_name="Lina Khalil",
            university_id="10001",
        )
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("confirm-payment", args=[student.id]),
            format="json",
        )

        student.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(student.status, Student.Status.ACTIVE_MEMBER)
        self.assertIsNotNone(student.payment_confirmed_at)
        self.assertEqual(student.payment_confirmed_by, self.admin)

        second_response = self.client.post(
            reverse("confirm-payment", args=[student.id]),
            format="json",
        )

        self.assertEqual(second_response.status_code, 409)

    def test_admin_can_view_membership_summary(self):
        Student.objects.create(full_name="Lina Khalil", university_id="10001")
        Student.objects.create(full_name="Omar Saleh", university_id="10002")
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("membership-summary"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_students"], 2)
        self.assertEqual(response.data["pending_payment"], 2)
        self.assertEqual(response.data["active_members"], 0)
