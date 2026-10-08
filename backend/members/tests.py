from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from members.models import Student


class StudentRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.registration_url = reverse("student-registration")
        self.valid_data = {
            "full_name": "Lina Khalil",
            "major": "Computer Science",
            "university_id": "0012345",
            "whatsapp": "+970 59 123 4567",
        }

    def test_student_can_register_with_required_membership_details(self):
        response = self.client.post(
            self.registration_url,
            {
                **self.valid_data,
                "full_name": "  Lina Khalil  ",
                "major": "  Computer Science  ",
            },
            format="json",
        )

        student = Student.objects.get(university_id="0012345")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(student.full_name, "Lina Khalil")
        self.assertEqual(student.major, "Computer Science")
        self.assertEqual(student.whatsapp, "+970591234567")
        self.assertEqual(student.status, Student.Status.PENDING_PAYMENT)
        self.assertEqual(response.data["status"], Student.Status.PENDING_PAYMENT)

    def test_duplicate_university_id_is_rejected(self):
        Student.objects.create(
            **{**self.valid_data, "whatsapp": "+970591234567"},
        )

        response = self.client.post(
            self.registration_url,
            {
                **self.valid_data,
                "full_name": "Another Student",
                "whatsapp": "0591234567",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Student.objects.count(), 1)
        self.assertIn("university_id", response.data)

    def test_missing_required_membership_details_are_rejected(self):
        response = self.client.post(
            self.registration_url,
            {"full_name": "Lina Khalil", "university_id": "0012345"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("major", response.data)
        self.assertIn("whatsapp", response.data)
        self.assertEqual(Student.objects.count(), 0)

    def test_whatsapp_number_must_have_a_valid_format(self):
        response = self.client.post(
            self.registration_url,
            {**self.valid_data, "whatsapp": "not-a-number"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("whatsapp", response.data)
        self.assertEqual(Student.objects.count(), 0)

    def test_empty_name_is_rejected(self):
        response = self.client.post(
            self.registration_url,
            {**self.valid_data, "full_name": "   "},
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

    def create_student(
        self,
        full_name,
        university_id,
        status=Student.Status.PENDING_PAYMENT,
        whatsapp="+970591234567",
    ):
        return Student.objects.create(
            full_name=full_name,
            major="Computer Science",
            university_id=university_id,
            whatsapp=whatsapp,
            status=status,
        )

    def test_student_list_requires_admin_access(self):
        response = self.client.get(reverse("student-list"))

        self.assertEqual(response.status_code, 403)

    def test_admin_can_search_by_university_id(self):
        self.create_student("Lina Khalil", "10001")
        self.create_student("Omar Saleh", "10002")
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("student-list"), {"search": "10002"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["full_name"], "Omar Saleh")

    def test_admin_can_search_by_whatsapp_number(self):
        self.create_student("Lina Khalil", "10001", whatsapp="+970591111111")
        self.create_student("Omar Saleh", "10002", whatsapp="+970592222222")
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("student-list"), {"search": "222222"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["full_name"], "Omar Saleh")

    def test_admin_can_filter_by_status(self):
        self.create_student("Lina Khalil", "10001")
        self.create_student("Omar Saleh", "10002", status=Student.Status.ACTIVE_MEMBER)
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(
            reverse("student-list"),
            {"status": Student.Status.PENDING_PAYMENT},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["university_id"], "10001")

    def test_admin_can_confirm_payment_once(self):
        student = self.create_student("Lina Khalil", "10001")
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
        self.create_student("Lina Khalil", "10001")
        self.create_student("Omar Saleh", "10002")
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("membership-summary"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_students"], 2)
        self.assertEqual(response.data["pending_payment"], 2)
        self.assertEqual(response.data["active_members"], 0)
