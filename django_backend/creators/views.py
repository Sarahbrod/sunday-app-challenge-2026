from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Creator, PlaybookEntry
from .serializers import CreatorSerializer, PlaybookEntrySerializer


class CreatorListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreatorSerializer

    def get_queryset(self):
        return self.request.user.creators.all()


class CreatorDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreatorSerializer

    def get_queryset(self):
        return self.request.user.creators.all()


class PlaybookListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PlaybookEntrySerializer

    def get_queryset(self):
        return self.request.user.playbook_entries.select_related("creator").all()


class PlaybookDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PlaybookEntrySerializer

    def get_queryset(self):
        return self.request.user.playbook_entries.all()
