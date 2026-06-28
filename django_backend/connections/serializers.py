from rest_framework import serializers
from .models import YouTubeChannel, PlatformConnection


class YouTubeChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = YouTubeChannel
        fields = [
            "id",
            "channel_id",
            "channel_name",
            "thumbnail_url",
            "subscriber_count",
            "status",
            "connected_at",
            "last_synced_at",
        ]
        read_only_fields = fields


class YouTubeChannelRegisterSerializer(serializers.ModelSerializer):
    """Accepts display-only metadata from the frontend after OAuth completes.
    No tokens — those are stored server-side by the OAuth callback."""

    class Meta:
        model = YouTubeChannel
        fields = ["channel_id", "channel_name", "thumbnail_url", "subscriber_count"]

    def create(self, validated_data):
        user = self.context["request"].user
        channel, _ = YouTubeChannel.objects.update_or_create(
            user=user,
            channel_id=validated_data["channel_id"],
            defaults={
                "channel_name": validated_data.get("channel_name", ""),
                "thumbnail_url": validated_data.get("thumbnail_url", ""),
                "subscriber_count": validated_data.get("subscriber_count", 0),
                "status": YouTubeChannel.STATUS_ACTIVE,
            },
        )
        return channel


class PlatformConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformConnection
        fields = [
            "id",
            "platform",
            "display_name",
            "avatar_url",
            "status",
            "connected_at",
        ]
        read_only_fields = fields
