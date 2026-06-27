from rest_framework import serializers
from .models import Experiment, ExperimentResult, ExperimentTemplate


class ExperimentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperimentTemplate
        fields = "__all__"


class ExperimentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperimentResult
        exclude = ["experiment"]


class ExperimentSerializer(serializers.ModelSerializer):
    result = ExperimentResultSerializer(read_only=True)

    class Meta:
        model = Experiment
        fields = [
            "id",
            "template",
            "title",
            "hypothesis",
            "variable",
            "success_metric",
            "creator_name",
            "status",
            "signal",
            "current_lift",
            "days_running",
            "started_at",
            "completed_at",
            "created_at",
            "updated_at",
            "result",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "result"]


class ExperimentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = [
            "template",
            "title",
            "hypothesis",
            "variable",
            "success_metric",
            "creator_name",
            "status",
            "signal",
            "current_lift",
            "days_running",
            "started_at",
            "completed_at",
        ]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ExperimentResultWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperimentResult
        fields = [
            "winner",
            "baseline",
            "result_value",
            "lift",
            "significance",
            "metric_unit",
            "what_happened",
            "why_it_may_have",
            "what_we_learned",
            "what_to_test_next",
            "completed_date",
        ]
