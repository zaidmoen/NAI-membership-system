import csv

from django.core.paginator import Paginator
from django.db import IntegrityError, transaction
from django.db.models import Case, Count, IntegerField, Q, Sum, Value, When
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from members.models import Student
from members.serializers import (
    AdminStudentSerializer,
    AdminStudentUpdateSerializer,
    ConfirmPaymentSerializer,
    StudentRegistrationSerializer,
)


def get_filtered_students(query_params):
    students = Student.objects.all()
    search_text = query_params.get("search", "").strip()
    status_filter = query_params.get("status", "").strip()
    volunteer_filter = query_params.get("is_volunteer", "").strip().lower()
    committee_filter = query_params.get("volunteer_committee", "").strip()

    if search_text:
        students = students.filter(
            Q(full_name__icontains=search_text)
            | Q(university_id__icontains=search_text)
            | Q(whatsapp__icontains=search_text)
        )

    allowed_statuses = [value for value, _label in Student.Status.choices]
    if status_filter:
        if status_filter not in allowed_statuses:
            return None, {"status": ["Use pending_payment or active_member"]}
        students = students.filter(status=status_filter)

    if volunteer_filter:
        if volunteer_filter not in {"true", "false"}:
            return None, {"is_volunteer": ["Use true or false"]}
        students = students.filter(is_volunteer=volunteer_filter == "true")

    allowed_committees = [value for value, _label in Student.Committee.choices]
    if committee_filter:
        if committee_filter not in allowed_committees:
            return None, {"volunteer_committee": ["Choose a valid committee"]}
        students = students.filter(volunteer_committee=committee_filter, is_volunteer=True)

    return students, None


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok", "service": "nai-membership-api"})


class StudentRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = StudentRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                student = serializer.save()
        except IntegrityError:
            return Response(
                {"university_id": ["This university ID is already registered"]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Membership request submitted successfully",
                "status": student.status,
            },
            status=status.HTTP_201_CREATED,
        )


class StudentListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        students, error = get_filtered_students(request.query_params)
        if error:
            return Response(error, status=status.HTTP_400_BAD_REQUEST)

        sort_option = request.query_params.get("sort", "newest").strip()
        sort_ordering = {
            "newest": ("-registered_at", "-id"),
            "oldest": ("registered_at", "id"),
            "name": ("full_name", "id"),
        }
        if sort_option == "pending":
            students = students.order_by(
                Case(
                    When(status=Student.Status.PENDING_PAYMENT, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                ),
                "-registered_at",
                "-id",
            )
        elif sort_option in sort_ordering:
            students = students.order_by(*sort_ordering[sort_option])
        else:
            return Response({"sort": ["Use newest, oldest, pending, or name"]}, status=status.HTTP_400_BAD_REQUEST)

        page_size = 10
        paginator = Paginator(students, page_size)
        page = paginator.get_page(request.query_params.get("page", 1))
        serializer = AdminStudentSerializer(page.object_list, many=True)
        return Response({
            "count": paginator.count,
            "page": page.number,
            "page_size": page_size,
            "total_pages": paginator.num_pages,
            "results": serializer.data,
        })


class StudentDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, student_id):
        student = get_object_or_404(Student, id=student_id)
        serializer = AdminStudentUpdateSerializer(student, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminStudentSerializer(student).data, status=status.HTTP_200_OK)

    def delete(self, request, student_id):
        student = get_object_or_404(Student, id=student_id)
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class StudentExportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        students, error = get_filtered_students(request.query_params)
        if error:
            return Response(error, status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="nai-members.csv"'
        response.write("\ufeff")
        writer = csv.writer(response)
        writer.writerow([
            "الاسم الكامل",
            "الرقم الجامعي",
            "التخصص",
            "رقم الواتساب",
            "متطوع حالي",
            "اللجنة",
            "رسوم الانتساب (شيكل)",
            "حالة العضوية",
            "تاريخ التسجيل",
            "تاريخ تأكيد الدفع",
            "اسم مستلم الدفعة",
        ])

        status_labels = dict(Student.Status.choices)
        committee_labels = dict(Student.Committee.choices)
        for student in students.order_by("full_name", "id"):
            writer.writerow([
                student.full_name,
                student.university_id,
                student.major,
                student.whatsapp,
                "نعم" if student.is_volunteer else "لا",
                committee_labels.get(student.volunteer_committee, "") if student.is_volunteer else "",
                student.membership_fee,
                status_labels[student.status],
                student.registered_at.isoformat(),
                student.payment_confirmed_at.isoformat() if student.payment_confirmed_at else "",
                student.payment_confirmed_by_name,
            ])

        return response


class MembershipSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        summary = Student.objects.aggregate(
            total_students=Count("id"),
            pending_payment=Count(
                "id",
                filter=Q(status=Student.Status.PENDING_PAYMENT),
            ),
            active_members=Count(
                "id",
                filter=Q(status=Student.Status.ACTIVE_MEMBER),
            ),
            volunteer_students=Count("id", filter=Q(is_volunteer=True)),
            confirmed_fees=Sum("membership_fee", filter=Q(status=Student.Status.ACTIVE_MEMBER)),
            pending_fees=Sum("membership_fee", filter=Q(status=Student.Status.PENDING_PAYMENT)),
        )
        summary["confirmed_fees"] = summary["confirmed_fees"] or 0
        summary["pending_fees"] = summary["pending_fees"] or 0
        return Response(summary)


class ConfirmPaymentView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, student_id):
        serializer = ConfirmPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        confirmed_by_name = serializer.validated_data["confirmed_by_name"]

        # The status check makes sure only one request can confirm this payment
        with transaction.atomic():
            updated_rows = Student.objects.filter(
                id=student_id,
                status=Student.Status.PENDING_PAYMENT,
            ).update(
                status=Student.Status.ACTIVE_MEMBER,
                payment_confirmed_at=timezone.now(),
                payment_confirmed_by_name=confirmed_by_name,
                payment_confirmed_by_id=request.user.id,
            )

        if updated_rows == 0:
            student = get_object_or_404(Student, id=student_id)

            return Response(
                {"detail": "This student is already an active member"},
                status=status.HTTP_409_CONFLICT,
            )

        student = Student.objects.get(id=student_id)
        serializer = AdminStudentSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)

