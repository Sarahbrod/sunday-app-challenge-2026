import hashlib
import hmac
import json
import os
import secrets
import urllib.parse
from datetime import datetime, timezone

import requests
from django.conf import settings
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import YouTubeChannel, PlatformConnection
from .serializers import YouTubeChannelSerializer, PlatformConnectionSerializer
from .utils import encrypt_token, decrypt_token


# ─── YouTube ──────────────────────────────────────────────────────────────────

YOUTUBE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token"
YOUTUBE_SCOPES = " ".join([
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
])


class YouTubeChannelListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        channels = request.user.youtube_channels.all()
        return Response(YouTubeChannelSerializer(channels, many=True).data)

    def delete(self, request, pk):
        try:
            channel = request.user.youtube_channels.get(pk=pk)
        except YouTubeChannel.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        channel.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class YouTubeOAuthStartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not settings.YOUTUBE_CLIENT_ID:
            return Response(
                {"detail": "YouTube OAuth not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        state = secrets.token_urlsafe(32)
        # Store state in session so we can verify on callback
        request.session["yt_oauth_state"] = state
        request.session["yt_oauth_user_id"] = str(request.user.id)

        params = {
            "client_id": settings.YOUTUBE_CLIENT_ID,
            "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
            "response_type": "code",
            "scope": YOUTUBE_SCOPES,
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        auth_url = f"{YOUTUBE_AUTH_URL}?{urllib.parse.urlencode(params)}"
        return Response({"auth_url": auth_url})


class YouTubeOAuthCallbackView(APIView):
    permission_classes = []  # Session-authenticated, not JWT

    def get(self, request):
        code = request.GET.get("code")
        state = request.GET.get("state")
        error = request.GET.get("error")

        frontend_url = settings.FRONTEND_URL

        if error:
            return redirect(f"{frontend_url}/oauth/callback?error={error}")

        stored_state = request.session.pop("yt_oauth_state", None)
        user_id = request.session.pop("yt_oauth_user_id", None)

        if not stored_state or not hmac.compare_digest(stored_state, state or ""):
            return redirect(f"{frontend_url}/oauth/callback?error=invalid_state")

        # Exchange code for tokens
        token_resp = requests.post(
            YOUTUBE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.YOUTUBE_CLIENT_ID,
                "client_secret": settings.YOUTUBE_CLIENT_SECRET,
                "redirect_uri": settings.YOUTUBE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )
        if not token_resp.ok:
            return redirect(f"{frontend_url}/oauth/callback?error=token_exchange_failed")

        tokens = token_resp.json()
        access_token = tokens.get("access_token", "")
        refresh_token = tokens.get("refresh_token", "")
        expires_in = tokens.get("expires_in", 3600)
        expires_at = datetime.now(timezone.utc).timestamp() + expires_in

        # Fetch channel info
        channel_resp = requests.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={"part": "snippet,statistics", "mine": "true"},
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        if not channel_resp.ok:
            return redirect(f"{frontend_url}/oauth/callback?error=channel_fetch_failed")

        items = channel_resp.json().get("items", [])
        if not items:
            return redirect(f"{frontend_url}/oauth/callback?error=no_channel")

        item = items[0]
        channel_id = item["id"]
        channel_name = item["snippet"]["title"]
        thumbnail_url = item["snippet"].get("thumbnails", {}).get("default", {}).get("url", "")
        subscriber_count = int(item["statistics"].get("subscriberCount", 0))

        # Upsert channel record
        from accounts.models import User
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return redirect(f"{frontend_url}/oauth/callback?error=user_not_found")

        channel, _ = YouTubeChannel.objects.update_or_create(
            user=user,
            channel_id=channel_id,
            defaults={
                "channel_name": channel_name,
                "thumbnail_url": thumbnail_url,
                "subscriber_count": subscriber_count,
                "access_token_enc": encrypt_token(access_token) if access_token else "",
                "refresh_token_enc": encrypt_token(refresh_token) if refresh_token else "",
                "token_expires_at": datetime.fromtimestamp(expires_at, tz=timezone.utc),
                "status": YouTubeChannel.STATUS_ACTIVE,
                "last_synced_at": datetime.now(timezone.utc),
            },
        )

        # Redirect with display-only metadata (no tokens)
        params = urllib.parse.urlencode({
            "platform": "youtube",
            "channelName": channel_name,
            "thumbnail": thumbnail_url,
            "channelId": channel_id,
        })
        return redirect(f"{frontend_url}/oauth/callback?{params}")


# ─── Platform connections ─────────────────────────────────────────────────────

class PlatformConnectionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        connections = request.user.platform_connections.all()
        return Response(PlatformConnectionSerializer(connections, many=True).data)


class PlatformConnectionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            conn = request.user.platform_connections.get(pk=pk)
        except PlatformConnection.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        conn.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
