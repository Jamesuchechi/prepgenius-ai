"""Views for AI tutor app."""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import ChatSession, ChatMessage
from .serializers import (
    ChatSessionSerializer,
    ChatMessageSerializer,
    CreateSessionSerializer,
    SuggestedQuestionSerializer
)
from .services import ChatService


class ChatSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing chat sessions."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSessionSerializer
    
    def get_queryset(self):
        """Get sessions for the current user."""
        return ChatSession.objects.filter(
            user=self.request.user,
            is_active=True
        ).order_by('-updated_at')
    
    def create(self, request):
        """Create a new chat session."""
        serializer = CreateSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        chat_service = ChatService()
        session = chat_service.create_session(
            user=request.user,
            subject=serializer.validated_data.get('subject'),
            exam_type=serializer.validated_data.get('exam_type'),
            title=serializer.validated_data.get('title'),
            tone=serializer.validated_data.get('tone', 'casual'),
            detail_level=serializer.validated_data.get('detail_level', 'detailed'),
            use_analogies=serializer.validated_data.get('use_analogies', True),
            socratic_mode=serializer.validated_data.get('socratic_mode', False)
        )
        
        response_serializer = ChatSessionSerializer(session)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, pk=None):
        """Soft delete a session."""
        chat_service = ChatService()
        success = chat_service.delete_session(pk, request.user)
        
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {'error': 'Session not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages for a specific session."""
        try:
            session = ChatSession.objects.get(
                id=pk,
                user=request.user,
                is_active=True
            )
        except ChatSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get messages with pagination
        messages = session.messages.all().order_by('timestamp')
        
        # Optional pagination
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = ChatMessageSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)


class SuggestedQuestionsView(APIView):
    """View for getting suggested questions."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get suggested questions based on user context."""
        subject = request.query_params.get('subject')
        
        chat_service = ChatService()
        questions = chat_service.get_suggested_questions(
            user=request.user,
            subject=subject
        )
        
        # Format as list of dicts
        question_data = [{'question': q} for q in questions]
        
        serializer = SuggestedQuestionSerializer(question_data, many=True)
        return Response(serializer.data)
