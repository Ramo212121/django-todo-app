from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = "__all__"

        # Frontend cannot change these
        read_only_fields = [
            "user",
            "created_at"
        ]

    # ==========================================
    # VALIDATION
    # ==========================================
    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        if len(value) > 200:
            raise serializers.ValidationError("Title cannot exceed 200 characters.")
        return value.strip()

    def validate_priority(self, value):
        if value not in ["low", "medium", "high"]:
            raise serializers.ValidationError("Priority must be low, medium, or high.")
        return value

    def validate_description(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError("Description cannot exceed 1000 characters.")
        return value