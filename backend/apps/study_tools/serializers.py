from rest_framework import serializers
from .models import Flashcard, FlashcardReviewLog, Document
from apps.content.serializers import SubjectSerializer, TopicSerializer

class FlashcardSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(source='subject', read_only=True)
    topic_details = TopicSerializer(source='topic', read_only=True)
    
    class Meta:
        model = Flashcard
        fields = [
            'id', 'subject', 'subject_details', 'topic', 'topic_details',
            'front', 'back', 'ease_factor', 'interval', 'repetitions',
            'next_review', 'source_type', 'created_at'
        ]
        read_only_fields = ['ease_factor', 'interval', 'repetitions', 'next_review', 'created_at']

class FlashcardReviewSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=0, max_value=3, help_text="0: Again, 1: Hard, 2: Good, 3: Easy")

class FlashcardSummarySerializer(serializers.Serializer):
    due_count = serializers.IntegerField()
    total_count = serializers.IntegerField()
    mastered_count = serializers.IntegerField()

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'file_type', 'processed', 
            'processing_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['processed', 'processing_status', 'created_at']
