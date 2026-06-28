from rest_framework import serializers
from .models import CsvUpload


class CsvUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CsvUpload
        fields = [
            "id", "file_name", "data_source", "row_count",
            "column_count", "column_headers", "truncated", "uploaded_at",
        ]
        read_only_fields = fields


class CsvUploadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CsvUpload
        fields = ["file_name", "data_source", "row_count", "column_count", "column_headers", "truncated"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
