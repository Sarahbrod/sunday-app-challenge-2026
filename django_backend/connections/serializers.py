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


class YouTubeChannelRegisterSerializer(serializers.Serializer):
    """Accepts display metadata + optional encrypted tokens from the Next.js callback.

    When the Next.js server-side OAuth callback calls this endpoint it can
    include access_token / refresh_token / token_expires_at so they are
    encrypted and stored on the Django side.  Frontend callers omit the token
    fields — display metadata only.
    """

    channel_id       = serializers.CharField()
    channel_name     = serializers.CharField()
    thumbnail_url    = serializers.URLField(required=False, allow_blank=True)
    subscriber_count = serializers.IntegerField(required=False, allow_null=True)

    # Token fields — write-only, only trusted server-side callers send these
    access_token     = serializers.CharField(required=False, write_only=True, allow_blank=True)
    refresh_token    = serializers.CharField(required=False, write_only=True, allow_blank=True)
    token_expires_at = serializers.DateTimeField(required=False, write_only=True, allow_null=True)

    def create(self, validated_data):
        from .utils import encrypt_token
        from datetime import datetime, timezone

        user = self.context["request"].user
        access_token  = validated_data.pop("access_token", "")
        refresh_token = validated_data.pop("refresh_token", "")
        expires_at    = validated_data.pop("token_expires_at", None)

        defaults = {
            "channel_name":    validated_data.get("channel_name", ""),
            "thumbnail_url":   validated_data.get("thumbnail_url", ""),
            "subscriber_count": validated_data.get("subscriber_count") or 0,
            "status":          YouTubeChannel.STATUS_ACTIVE,
        }

        if access_token:
            defaults["access_token_enc"] = encrypt_token(access_token)
        if refresh_token:
            defaults["refresh_token_enc"] = encrypt_token(refresh_token)
        if expires_at:
            defaults["token_expires_at"] = expires_at
        if access_token or refresh_token:
            defaults["last_synced_at"] = datetime.now(timezone.utc)

        channel, _ = YouTubeChannel.objects.update_or_create(
            user=user,
            channel_id=validated_data["channel_id"],
            defaults=defaults,
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
