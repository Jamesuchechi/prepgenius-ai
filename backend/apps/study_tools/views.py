from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Document, Flashcard
from .serializers import (
    FlashcardSerializer, FlashcardReviewSerializer, 
    FlashcardSummarySerializer, DocumentSerializer
)
from .services.srs_service import SRSService

class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user documents (PDFs, etc).
    """
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FlashcardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user flashcards and SRS reviews.
    """
    serializer_class = FlashcardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['front', 'back', 'subject__name', 'topic__name']

    def get_queryset(self):
        return Flashcard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def due(self, request):
        """
        List all flashcards that are due for review.
        """
        now = timezone.now().date()
        due_cards = self.get_queryset().filter(next_review__lte=now)
        page = self.paginate_queryset(due_cards)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(due_cards, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """
        Record a review for a flashcard and update its SRS data.
        """
        flashcard = self.get_object()
        serializer = FlashcardReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            rating = serializer.validated_data['rating']
            updated_card = SRSService.update_flashcard_srs(flashcard, rating)
            return Response(FlashcardSerializer(updated_card).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get a summary of flashcard progress.
        """
        qs = self.get_queryset()
        now = timezone.now().date()
        
        data = {
            'due_count': qs.filter(next_review__lte=now).count(),
            'total_count': qs.count(),
            'mastered_count': qs.filter(ease_factor__gte=2.5, repetitions__gte=5).count()
        }
        return Response(data)
