import re

from rest_framework import serializers

from members.models import Student


class StudentRegistrationSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=150, trim_whitespace=True)
    major = serializers.CharField(max_length=100, trim_whitespace=True)
    university_id = serializers.CharField(max_length=30, trim_whitespace=True)
    whatsapp = serializers.CharField(max_length=25, trim_whitespace=True)
    is_volunteer = serializers.BooleanField(required=True)
    volunteer_committee = serializers.ChoiceField(
        choices=Student.Committee.choices,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Student
        fields = [
            "full_name",
            "major",
            "university_id",
            "whatsapp",
            "is_volunteer",
            "volunteer_committee",
        ]

    def validate(self, attrs):
        is_volunteer = attrs.get("is_volunteer", False)
        committee = attrs.get("volunteer_committee", "")

        if is_volunteer and not committee:
            raise serializers.ValidationError({"volunteer_committee": "Choose a committee"})

        if not is_volunteer:
            attrs["volunteer_committee"] = ""

        return attrs

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
            "is_volunteer",
            "volunteer_committee",
            "status",
            "registered_at",
            "payment_confirmed_at",
            "payment_confirmed_by_name",
            "payment_confirmed_by",
        ]
        read_only_fields = fields


class AdminStudentUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=150, trim_whitespace=True, required=False)
    major = serializers.CharField(max_length=100, trim_whitespace=True, required=False)
    university_id = serializers.CharField(max_length=30, trim_whitespace=True, required=False)
    whatsapp = serializers.CharField(max_length=25, trim_whitespace=True, required=False)
    is_volunteer = serializers.BooleanField(required=False)
    volunteer_committee = serializers.ChoiceField(
        choices=Student.Committee.choices,
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Student
        fields = [
            "full_name",
            "major",
            "university_id",
            "whatsapp",
            "is_volunteer",
            "volunteer_committee",
        ]

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

    def validate(self, attrs):
        is_volunteer = attrs.get("is_volunteer", self.instance.is_volunteer)
        committee = attrs.get("volunteer_committee", self.instance.volunteer_committee)

        if is_volunteer and not committee:
            raise serializers.ValidationError({"volunteer_committee": "Choose a committee"})

        if not is_volunteer:
            attrs["volunteer_committee"] = ""

        return attrs


class ConfirmPaymentSerializer(serializers.Serializer):
    confirmed_by_name = serializers.CharField(max_length=100, trim_whitespace=True)

    def validate_confirmed_by_name(self, value):
        cleaned_name = " ".join(value.split())
        if not cleaned_name:
            raise serializers.ValidationError("Enter the name of the person who received the payment")
        return cleaned_name

