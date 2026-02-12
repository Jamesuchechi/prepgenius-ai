"""Serializers for AI tutor app."""
from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'timestamp', 'metadata']
        read_only_fields = ['id', 'timestamp']


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions."""
    
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'subject', 'exam_type', 'title', 'is_active',
            'created_at', 'updated_at', 'message_count', 'last_message'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        """Get the number of messages in the session."""
        return obj.messages.count()
    
    def get_last_message(self, obj):
        """Get the last message in the session."""
        last_msg = obj.messages.order_by('-timestamp').first()
        if last_msg:
            return {
                'role': last_msg.role,
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'timestamp': last_msg.timestamp
            }
        return None


class CreateSessionSerializer(serializers.Serializer):
    """Serializer for creating a new chat session."""
    
    subject = serializers.CharField(max_length=100, required=False, allow_blank=True)
    exam_type = serializers.CharField(max_length=50, required=False, allow_blank=True)
    title = serializers.CharField(max_length=255, required=False, allow_blank=True)


class SuggestedQuestionSerializer(serializers.Serializer):
    """Serializer for suggested questions."""
    
    question = serializers.CharField()
    category = serializers.CharField(required=False)
