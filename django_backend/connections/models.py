import uuid
from django.db import models
from django.conf import settings


class YouTubeChannel(models.Model):
    STATUS_ACTIVE = "ACTIVE"
    STATUS_RECONNECT = "RECONNECT_REQUIRED"
    STATUS_INACTIVE = "INACTIVE"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_RECONNECT, "Reconnect Required"),
        (STATUS_INACTIVE, "Inactive"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="youtube_channels",
    )
    channel_id = models.CharField(max_length=64)
    channel_name = models.CharField(max_length=255)
    thumbnail_url = models.URLField(blank=True)
    subscriber_count = models.BigIntegerField(default=0)
    # Tokens stored encrypted — never in plaintext
    access_token_enc = models.TextField(blank=True)
    refresh_token_enc = models.TextField(blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    connected_at = models.DateTimeField(auto_now_add=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [("user", "channel_id")]
        db_table = "connections_youtube_channel"

    def __str__(self):
        return f"{self.channel_name} ({self.user.email})"


class PlatformConnection(models.Model):
    PLATFORM_SPOTIFY = "spotify"
    PLATFORM_CHOICES = [
        (PLATFORM_SPOTIFY, "Spotify"),
    ]
    STATUS_ACTIVE = "ACTIVE"
    STATUS_INACTIVE = "INACTIVE"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_INACTIVE, "Inactive"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="platform_connections",
    )
    platform = models.CharField(max_length=32, choices=PLATFORM_CHOICES)
    display_name = models.CharField(max_length=255)
    avatar_url = models.URLField(blank=True)
    access_token_enc = models.TextField(blank=True)
    refresh_token_enc = models.TextField(blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    connected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("user", "platform")]
        db_table = "connections_platform"

    def __str__(self):
        return f"{self.platform}:{self.display_name} ({self.user.email})"
