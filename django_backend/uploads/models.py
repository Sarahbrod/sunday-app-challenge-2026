import uuid
from django.db import models
from django.conf import settings


class CsvUpload(models.Model):
    SOURCE_YOUTUBE = "YOUTUBE_EXPORT"
    SOURCE_SPOTIFY = "SPOTIFY_EXPORT"
    SOURCE_CUSTOM = "CUSTOM"
    SOURCE_UNKNOWN = "UNKNOWN"
    SOURCE_CHOICES = [
        (SOURCE_YOUTUBE, "YouTube Export"),
        (SOURCE_SPOTIFY, "Spotify Export"),
        (SOURCE_CUSTOM, "Custom"),
        (SOURCE_UNKNOWN, "Unknown"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="csv_uploads"
    )
    file_name = models.CharField(max_length=255)
    data_source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default=SOURCE_UNKNOWN)
    row_count = models.IntegerField(default=0)
    column_count = models.IntegerField(default=0)
    column_headers = models.JSONField(default=list)
    truncated = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "uploads_csv_upload"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.file_name} ({self.user.email})"
