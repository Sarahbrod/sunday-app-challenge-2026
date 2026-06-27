from rest_framework import serializers
from .models import Creator, PlaybookEntry


class CreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Creator
        fields = [
            "id", "name", "platform", "tier", "subscribers",
            "avatar_url", "youtube_channel_id", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class PlaybookEntrySerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source="creator.name", read_only=True)

    class Meta:
        model = PlaybookEntry
        fields = [
            "id", "creator", "creator_name", "title", "insight",
            "experiment_count", "avg_lift", "created_at",
        ]
        read_only_fields = ["id", "created_at", "creator_name"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
