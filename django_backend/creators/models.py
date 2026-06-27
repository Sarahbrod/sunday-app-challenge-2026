import uuid
from django.db import models
from django.conf import settings


class Creator(models.Model):
    PLATFORM_YOUTUBE = "YouTube"
    PLATFORM_PODCAST = "Podcast"
    PLATFORM_NEWSLETTER = "Newsletter"
    PLATFORM_CHOICES = [
        (PLATFORM_YOUTUBE, "YouTube"),
        (PLATFORM_PODCAST, "Podcast"),
        (PLATFORM_NEWSLETTER, "Newsletter"),
    ]

    TIER_TOP = "top"
    TIER_GOOD = "good"
    TIER_WATCH = "watch"
    TIER_RISK = "risk"
    TIER_CHOICES = [
        (TIER_TOP, "Top Performer"),
        (TIER_GOOD, "Good"),
        (TIER_WATCH, "Watch"),
        (TIER_RISK, "At Risk"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="creators",
    )
    name = models.CharField(max_length=255)
    platform = models.CharField(max_length=32, choices=PLATFORM_CHOICES)
    tier = models.CharField(max_length=16, choices=TIER_CHOICES, default=TIER_GOOD)
    subscribers = models.CharField(max_length=32, blank=True)
    avatar_url = models.URLField(blank=True)
    youtube_channel_id = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "creators_creator"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.platform})"


class PlaybookEntry(models.Model):
    """Shared experiment insights / playbook entries."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="playbook_entries",
    )
    creator = models.ForeignKey(
        Creator,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="playbook_entries",
    )
    title = models.CharField(max_length=255)
    insight = models.TextField()
    experiment_count = models.IntegerField(default=1)
    avg_lift = models.CharField(max_length=32, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "creators_playbook_entry"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
