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
            "is_volunteer": False,
            "volunteer_committee": "",
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
        self.assertFalse(student.is_volunteer)
        self.assertEqual(student.membership_fee, 20)
        self.assertEqual(response.data["status"], Student.Status.PENDING_PAYMENT)

    def test_existing_volunteer_can_register_with_their_committee(self):
        response = self.client.post(
            self.registration_url,
            {**self.valid_data, "is_volunteer": True, "volunteer_committee": Student.Committee.TECHNICAL},
            format="json",
        )

        student = Student.objects.get(university_id="0012345")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(student.is_volunteer)
        self.assertEqual(student.volunteer_committee, Student.Committee.TECHNICAL)
        self.assertEqual(student.membership_fee, 10)

    def test_current_volunteer_must_choose_a_committee(self):
        response = self.client.post(
            self.registration_url,
            {**self.valid_data, "is_volunteer": True},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("volunteer_committee", response.data)
        self.assertEqual(Student.objects.count(), 0)

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

    def test_admin_can_edit_student_details_and_volunteer_committee(self):
        student = self.create_student("Lina Khalil", "10001")
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            reverse("student-detail", args=[student.id]),
            {
                "full_name": "Lina K",
                "is_volunteer": True,
                "volunteer_committee": Student.Committee.TECHNICAL,
            },
            format="json",
        )

        student.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(student.full_name, "Lina K")
        self.assertTrue(student.is_volunteer)
        self.assertEqual(student.volunteer_committee, Student.Committee.TECHNICAL)
        self.assertEqual(student.membership_fee, 10)

    def test_editing_paid_member_does_not_change_recorded_fee(self):
        student = self.create_student("Lina Khalil", "10001", status=Student.Status.ACTIVE_MEMBER)
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            reverse("student-detail", args=[student.id]),
            {"is_volunteer": True, "volunteer_committee": Student.Committee.TECHNICAL},
            format="json",
        )

        student.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(student.membership_fee, 20)

    def test_admin_can_delete_student_record(self):
        student = self.create_student("Lina Khalil", "10001")
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(reverse("student-detail", args=[student.id]))

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Student.objects.filter(id=student.id).exists())

    def test_student_edit_rejects_duplicate_university_id(self):
        student = self.create_student("Lina Khalil", "10001")
        self.create_student("Omar Saleh", "10002")
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            reverse("student-detail", args=[student.id]),
            {"university_id": "10002"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        student.refresh_from_db()
        self.assertEqual(student.university_id, "10001")

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

    def test_admin_can_filter_by_volunteer_and_committee(self):
        Student.objects.create(
            full_name="Lina Khalil",
            major="Computer Science",
            university_id="10001",
            whatsapp="+970591234567",
            is_volunteer=True,
            volunteer_committee=Student.Committee.TECHNICAL,
            membership_fee=10,
        )
        self.create_student("Omar Saleh", "10002")
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(
            reverse("student-list"),
            {"is_volunteer": "true", "volunteer_committee": Student.Committee.TECHNICAL},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["university_id"], "10001")

    def test_invalid_volunteer_filter_is_rejected(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("student-list"), {"is_volunteer": "sometimes"})

        self.assertEqual(response.status_code, 400)
        self.assertIn("is_volunteer", response.data)

    def test_admin_can_confirm_payment_once(self):
        student = self.create_student("Lina Khalil", "10001")
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("confirm-payment", args=[student.id]),
            {"confirmed_by_name": "  Zaid   Mayala  "},
            format="json",
        )

        student.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(student.status, Student.Status.ACTIVE_MEMBER)
        self.assertIsNotNone(student.payment_confirmed_at)
        self.assertEqual(student.payment_confirmed_by_name, "Zaid Mayala")
        self.assertEqual(student.payment_confirmed_by, self.admin)

        second_response = self.client.post(
            reverse("confirm-payment", args=[student.id]),
            {"confirmed_by_name": "Zaid Mayala"},
            format="json",
        )

        self.assertEqual(second_response.status_code, 409)

    def test_payment_confirmation_requires_receiver_name(self):
        student = self.create_student("Lina Khalil", "10001")
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            reverse("confirm-payment", args=[student.id]),
            {"confirmed_by_name": "   "},
            format="json",
        )

        student.refresh_from_db()
        self.assertEqual(response.status_code, 400)
        self.assertEqual(student.status, Student.Status.PENDING_PAYMENT)

    def test_admin_can_export_filtered_students_as_csv(self):
        self.create_student("Lina Khalil", "10001")
        self.create_student("Omar Saleh", "10002", status=Student.Status.ACTIVE_MEMBER)
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(
            reverse("student-export"),
            {"search": "Omar", "status": Student.Status.ACTIVE_MEMBER},
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("text/csv", response["Content-Type"])
        self.assertIn("attachment; filename=\"nai-members.csv\"", response["Content-Disposition"])
        self.assertTrue(response.content.startswith(b"\xef\xbb\xbf"))
        self.assertIn("رسوم الانتساب (شيكل)".encode(), response.content)
        self.assertIn("Omar Saleh".encode(), response.content)
        self.assertNotIn("Lina Khalil".encode(), response.content)

    def test_admin_can_view_membership_summary(self):
        self.create_student("Lina Khalil", "10001")
        self.create_student("Omar Saleh", "10002")
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(reverse("membership-summary"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_students"], 2)
        self.assertEqual(response.data["pending_payment"], 2)
        self.assertEqual(response.data["active_members"], 0)
        self.assertEqual(response.data["confirmed_fees"], 0)
        self.assertEqual(response.data["pending_fees"], 40)

