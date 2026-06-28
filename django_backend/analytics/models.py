import uuid
from django.db import models
from django.conf import settings


class GrowthScore(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="growth_scores"
    )
    overall = models.IntegerField(default=0)
    delta = models.IntegerField(default=0)
    experiment_velocity = models.IntegerField(default=0)
    win_rate = models.IntegerField(default=0)
    implementation = models.IntegerField(default=0)
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "analytics_growth_score"
        ordering = ["-calculated_at"]
        get_latest_by = "calculated_at"

    def __str__(self):
        return f"GrowthScore {self.overall} ({self.user.email})"


class PerformanceSnapshot(models.Model):
    """Daily/weekly aggregated metrics per user."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="performance_snapshots"
    )
    period_label = models.CharField(max_length=16)   # e.g. "W1", "Jan"
    views = models.BigIntegerField(default=0)
    watch_time = models.BigIntegerField(default=0)
    subscribers = models.BigIntegerField(default=0)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "analytics_performance_snapshot"
        ordering = ["recorded_at"]
