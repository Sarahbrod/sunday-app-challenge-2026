from django.urls import path
from .views import (
    YouTubeChannelListView,
    YouTubeOAuthStartView,
    YouTubeOAuthCallbackView,
    PlatformConnectionListView,
    PlatformConnectionDetailView,
)

urlpatterns = [
    path("youtube/", YouTubeChannelListView.as_view(), name="youtube-list"),
    path("youtube/<uuid:pk>/", YouTubeChannelListView.as_view(), name="youtube-delete"),
    path("youtube/oauth/start/", YouTubeOAuthStartView.as_view(), name="youtube-oauth-start"),
    path("youtube/callback/", YouTubeOAuthCallbackView.as_view(), name="youtube-callback"),
    path("platforms/", PlatformConnectionListView.as_view(), name="platform-list"),
    path("platforms/<uuid:pk>/", PlatformConnectionDetailView.as_view(), name="platform-delete"),
]
