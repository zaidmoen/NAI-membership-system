import re

from rest_framework import serializers

from members.models import Student


class StudentRegistrationSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=150, trim_whitespace=True)
    major = serializers.CharField(max_length=100, trim_whitespace=True)
    university_id = serializers.CharField(max_length=30, trim_whitespace=True)
    whatsapp = serializers.CharField(max_length=25, trim_whitespace=True)

    class Meta:
        model = Student
        fields = ["full_name", "major", "university_id", "whatsapp"]

    def validate_full_name(self, value):
        cleaned_name = " ".join(value.split())

        if not cleaned_name:
            raise serializers.ValidationError("Enter the student's full name")

        return cleaned_name

    def validate_major(self, value):
        cleaned_major = " ".join(value.split())

        if not cleaned_major:
            raise serializers.ValidationError("Enter the student's major")

        return cleaned_major

    def validate_whatsapp(self, value):
        cleaned_number = re.sub(r"[\s()-]", "", value)

        if not re.fullmatch(r"\+?\d{7,15}", cleaned_number):
            raise serializers.ValidationError("Enter a valid WhatsApp number")

        return cleaned_number


class AdminStudentSerializer(serializers.ModelSerializer):
    payment_confirmed_by = serializers.CharField(
        source="payment_confirmed_by.username",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Student
        fields = [
            "id",
            "full_name",
            "major",
            "university_id",
            "whatsapp",
            "status",
            "registered_at",
            "payment_confirmed_at",
            "payment_confirmed_by",
        ]
        read_only_fields = fields
