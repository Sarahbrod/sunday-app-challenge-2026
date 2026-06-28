from django.urls import path
from .views import GrowthScoreView, PerformanceSnapshotListView

urlpatterns = [
    path("growth-score/", GrowthScoreView.as_view(), name="growth-score"),
    path("snapshots/", PerformanceSnapshotListView.as_view(), name="performance-snapshots"),
]
