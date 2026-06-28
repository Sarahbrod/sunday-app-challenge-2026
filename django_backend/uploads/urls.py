from django.urls import path
from .views import CsvUploadView, CsvUploadListView

urlpatterns = [
    path("csv/", CsvUploadView.as_view(), name="csv-upload"),
    path("csv/history/", CsvUploadListView.as_view(), name="csv-history"),
]
