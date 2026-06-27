from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/connections/", include("connections.urls")),
    path("api/experiments/", include("experiments.urls")),
    path("api/creators/", include("creators.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/uploads/", include("uploads.urls")),
]
