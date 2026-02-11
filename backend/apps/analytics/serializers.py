from rest_framework import serializers
from .models import ProgressTracker, TopicMastery, StudySession
from apps.content.serializers import SubjectSerializer, TopicSerializer

class ProgressTrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressTracker
        fields = [
            'total_questions_attempted',
            'total_correct_answers',
            'current_streak',
            'longest_streak',
            'last_activity_date',
            'total_study_time_seconds',
        ]

class TopicMasterySerializer(serializers.ModelSerializer):
    topic_details = TopicSerializer(source='topic', read_only=True)
    
    class Meta:
        model = TopicMastery
        fields = [
            'id',
            'topic',
            'topic_details',
            'total_attempts',
            'correct_attempts',
            'mastery_percentage',
            'time_spent_seconds',
            'last_practiced',
        ]

class StudySessionSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(source='subject', read_only=True)
    
    class Meta:
        model = StudySession
        fields = [
            'id',
            'subject',
            'subject_details',
            'start_time',
            'end_time',
            'duration_seconds',
            'questions_attempted',
            'correct_questions',
        ]
