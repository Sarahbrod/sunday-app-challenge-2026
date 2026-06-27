from django.urls import path
from .views import CreatorListCreateView, CreatorDetailView, PlaybookListCreateView, PlaybookDetailView

urlpatterns = [
    path("", CreatorListCreateView.as_view(), name="creator-list"),
    path("<uuid:pk>/", CreatorDetailView.as_view(), name="creator-detail"),
    path("playbook/", PlaybookListCreateView.as_view(), name="playbook-list"),
    path("playbook/<uuid:pk>/", PlaybookDetailView.as_view(), name="playbook-detail"),
]
