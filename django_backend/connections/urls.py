from django.urls import path
from .views import (
    YouTubeChannelListView,
    YouTubeChannelDetailView,
    YouTubeOAuthStartView,
    YouTubeOAuthCallbackView,
    PlatformConnectionListView,
    PlatformConnectionDetailView,
)

urlpatterns = [
    path("youtube/", YouTubeChannelListView.as_view(), name="youtube-list"),
    path("youtube/<uuid:pk>/", YouTubeChannelDetailView.as_view(), name="youtube-detail"),
    path("youtube/oauth/start/", YouTubeOAuthStartView.as_view(), name="youtube-oauth-start"),
    path("youtube/callback/", YouTubeOAuthCallbackView.as_view(), name="youtube-callback"),
    path("platforms/", PlatformConnectionListView.as_view(), name="platform-list"),
    path("platforms/<uuid:pk>/", PlatformConnectionDetailView.as_view(), name="platform-delete"),
]
