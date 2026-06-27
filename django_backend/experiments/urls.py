from django.urls import path
from .views import (
    ExperimentTemplateListView,
    ExperimentListCreateView,
    ExperimentDetailView,
    ExperimentResultView,
)

urlpatterns = [
    path("templates/", ExperimentTemplateListView.as_view(), name="experiment-templates"),
    path("", ExperimentListCreateView.as_view(), name="experiment-list"),
    path("<uuid:pk>/", ExperimentDetailView.as_view(), name="experiment-detail"),
    path("<uuid:pk>/result/", ExperimentResultView.as_view(), name="experiment-result"),
]
