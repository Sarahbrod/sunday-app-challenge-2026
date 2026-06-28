from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import GrowthScore, PerformanceSnapshot
from .serializers import GrowthScoreSerializer, PerformanceSnapshotSerializer


class GrowthScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            score = request.user.growth_scores.latest()
            return Response(GrowthScoreSerializer(score).data)
        except GrowthScore.DoesNotExist:
            return Response(None)


class PerformanceSnapshotListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PerformanceSnapshotSerializer

    def get_queryset(self):
        return self.request.user.performance_snapshots.all()
