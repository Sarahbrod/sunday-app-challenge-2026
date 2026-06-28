from rest_framework import serializers
from .models import GrowthScore, PerformanceSnapshot


class GrowthScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrowthScore
        fields = [
            "id", "overall", "delta", "experiment_velocity",
            "win_rate", "implementation", "calculated_at",
        ]
        read_only_fields = fields


class PerformanceSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceSnapshot
        fields = [
            "id", "period_label", "views", "watch_time",
            "subscribers", "revenue", "recorded_at",
        ]
        read_only_fields = fields
