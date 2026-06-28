import csv
import io
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics

from .models import CsvUpload
from .serializers import CsvUploadSerializer, CsvUploadCreateSerializer

MAX_ROWS = 5_000
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def detect_source(headers: list[str]) -> str:
    h = [c.lower() for c in headers]
    if any("video title" in c or "video id" in c for c in h) and any("views" in c or "impressions" in c for c in h):
        return CsvUpload.SOURCE_YOUTUBE
    if any("streams" in c or "listeners" in c for c in h) and any("podcast" in c or "episode" in c for c in h):
        return CsvUpload.SOURCE_SPOTIFY
    if h:
        return CsvUpload.SOURCE_CUSTOM
    return CsvUpload.SOURCE_UNKNOWN


class CsvUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > MAX_FILE_SIZE:
            return Response({"detail": "File too large (max 10 MB)."}, status=status.HTTP_400_BAD_REQUEST)

        content = file.read().decode("utf-8-sig", errors="replace")
        reader = csv.DictReader(io.StringIO(content))
        headers = reader.fieldnames or []

        rows = []
        truncated = False
        for row in reader:
            if len(rows) >= MAX_ROWS:
                truncated = True
                break
            rows.append(row)

        record = CsvUpload.objects.create(
            user=request.user,
            file_name=file.name,
            data_source=detect_source(list(headers)),
            row_count=len(rows),
            column_count=len(headers),
            column_headers=list(headers),
            truncated=truncated,
        )

        return Response(
            {
                **CsvUploadSerializer(record).data,
                "columns": list(headers),
                "rows": rows[:200],  # Return preview rows, not the full dataset
            },
            status=status.HTTP_201_CREATED,
        )


class CsvUploadListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CsvUploadSerializer

    def get_queryset(self):
        return self.request.user.csv_uploads.all()
