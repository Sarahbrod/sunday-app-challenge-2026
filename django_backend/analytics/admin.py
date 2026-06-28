from django.contrib import admin
from .models import GrowthScore, PerformanceSnapshot


@admin.register(GrowthScore)
class GrowthScoreAdmin(admin.ModelAdmin):
    list_display = ["user", "overall", "delta", "win_rate", "calculated_at"]
    readonly_fields = ["calculated_at"]


@admin.register(PerformanceSnapshot)
class PerformanceSnapshotAdmin(admin.ModelAdmin):
    list_display = ["user", "period_label", "views", "subscribers", "recorded_at"]
    readonly_fields = ["recorded_at"]
