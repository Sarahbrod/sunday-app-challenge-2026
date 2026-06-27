from django.contrib import admin
from .models import YouTubeChannel, PlatformConnection


@admin.register(YouTubeChannel)
class YouTubeChannelAdmin(admin.ModelAdmin):
    list_display = ["channel_name", "user", "subscriber_count", "status", "connected_at"]
    list_filter = ["status"]
    search_fields = ["channel_name", "channel_id", "user__email"]
    readonly_fields = ["connected_at", "last_synced_at", "access_token_enc", "refresh_token_enc"]


@admin.register(PlatformConnection)
class PlatformConnectionAdmin(admin.ModelAdmin):
    list_display = ["display_name", "platform", "user", "status", "connected_at"]
    list_filter = ["platform", "status"]
    search_fields = ["display_name", "user__email"]
    readonly_fields = ["connected_at", "access_token_enc", "refresh_token_enc"]
