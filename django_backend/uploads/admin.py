from django.contrib import admin
from .models import CsvUpload


@admin.register(CsvUpload)
class CsvUploadAdmin(admin.ModelAdmin):
    list_display = ["file_name", "user", "data_source", "row_count", "truncated", "uploaded_at"]
    list_filter = ["data_source", "truncated"]
    search_fields = ["file_name", "user__email"]
    readonly_fields = ["uploaded_at"]
