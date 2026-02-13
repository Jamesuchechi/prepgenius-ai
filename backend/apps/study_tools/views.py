from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Document.objects.filter(user=self.request.user).order_by('-created_at')
        
        # Filter by processed status
        processed = self.request.query_params.get('processed')
        if processed:
            is_processed = processed.lower() == 'true'
            queryset = queryset.filter(processed=is_processed)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
