from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import SignupSerializer, LoginSerializer, UserSerializer, UpdateProfileSerializer


def _cookie_settings(secure: bool):
    return dict(
        httponly=True,
        secure=secure,
        samesite="Lax",
    )


def _set_auth_cookies(response: Response, refresh: RefreshToken, secure: bool):
    jwt_settings = settings.SIMPLE_JWT
    access_lifetime = jwt_settings["ACCESS_TOKEN_LIFETIME"]
    refresh_lifetime = jwt_settings["REFRESH_TOKEN_LIFETIME"]
    cookie_kwargs = _cookie_settings(secure)

    response.set_cookie(
        jwt_settings.get("AUTH_COOKIE", "access_token"),
        str(refresh.access_token),
        max_age=int(access_lifetime.total_seconds()),
        **cookie_kwargs,
    )
    response.set_cookie(
        jwt_settings.get("AUTH_COOKIE_REFRESH", "refresh_token"),
        str(refresh),
        max_age=int(refresh_lifetime.total_seconds()),
        path="/api/auth/token/refresh/",
        **cookie_kwargs,
    )


def _clear_auth_cookies(response: Response):
    jwt_settings = settings.SIMPLE_JWT
    response.delete_cookie(jwt_settings.get("AUTH_COOKIE", "access_token"))
    response.delete_cookie(
        jwt_settings.get("AUTH_COOKIE_REFRESH", "refresh_token"),
        path="/api/auth/token/refresh/",
    )


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        _set_auth_cookies(response, refresh, not settings.DEBUG)
        return response


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        response = Response(UserSerializer(user).data)
        _set_auth_cookies(response, refresh, not settings.DEBUG)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_cookie = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token")
        raw_refresh = request.COOKIES.get(refresh_cookie)
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                pass

        response = Response({"detail": "Logged out."})
        _clear_auth_cookies(response)
        return response


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_cookie = settings.SIMPLE_JWT.get("AUTH_COOKIE_REFRESH", "refresh_token")
        raw_refresh = request.COOKIES.get(refresh_cookie)

        if not raw_refresh:
            return Response(
                {"detail": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(raw_refresh)
            response = Response({"detail": "Token refreshed."})
            _set_auth_cookies(response, refresh, not settings.DEBUG)
            return response
        except TokenError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)
