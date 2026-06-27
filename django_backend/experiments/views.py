from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Experiment, ExperimentTemplate
from .serializers import (
    ExperimentSerializer,
    ExperimentWriteSerializer,
    ExperimentTemplateSerializer,
    ExperimentResultWriteSerializer,
)


class ExperimentTemplateListView(generics.ListAPIView):
    queryset = ExperimentTemplate.objects.all()
    serializer_class = ExperimentTemplateSerializer
    permission_classes = [IsAuthenticated]


class ExperimentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status"]

    def get_queryset(self):
        return self.request.user.experiments.select_related("result").all()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ExperimentWriteSerializer
        return ExperimentSerializer

    def create(self, request, *args, **kwargs):
        serializer = ExperimentWriteSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        experiment = serializer.save()
        return Response(ExperimentSerializer(experiment).data, status=status.HTTP_201_CREATED)


class ExperimentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.experiments.select_related("result").all()

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ExperimentWriteSerializer
        return ExperimentSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = ExperimentWriteSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        experiment = serializer.save()
        return Response(ExperimentSerializer(experiment).data)


class ExperimentResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get_experiment(self, request, pk):
        try:
            return request.user.experiments.get(pk=pk)
        except Experiment.DoesNotExist:
            return None

    def post(self, request, pk):
        experiment = self.get_experiment(request, pk)
        if experiment is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ExperimentResultWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(experiment=experiment)

        experiment.status = Experiment.STATUS_COMPLETED
        experiment.save(update_fields=["status"])

        return Response(ExperimentSerializer(experiment).data, status=status.HTTP_201_CREATED)

    def patch(self, request, pk):
        experiment = self.get_experiment(request, pk)
        if experiment is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        try:
            result = experiment.result
        except Exception:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ExperimentResultWriteSerializer(result, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ExperimentSerializer(experiment).data)
