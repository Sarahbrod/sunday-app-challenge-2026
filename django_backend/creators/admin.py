from django.contrib import admin
from .models import Creator, PlaybookEntry


@admin.register(Creator)
class CreatorAdmin(admin.ModelAdmin):
    list_display = ["name", "platform", "tier", "subscribers", "user"]
    list_filter = ["platform", "tier"]
    search_fields = ["name", "user__email"]


@admin.register(PlaybookEntry)
class PlaybookEntryAdmin(admin.ModelAdmin):
    list_display = ["title", "creator", "experiment_count", "avg_lift", "created_at"]
    search_fields = ["title"]
