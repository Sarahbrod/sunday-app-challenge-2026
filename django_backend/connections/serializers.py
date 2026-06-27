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
