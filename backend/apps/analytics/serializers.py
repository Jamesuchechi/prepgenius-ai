from rest_framework import serializers
from .models import ProgressTracker, TopicMastery, StudySession, SpacedRepetitionItem

class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = ['start_time', 'end_time', 'duration_minutes', 'questions_answered', 'correct_count']
        read_only_fields = fields

class SpacedRepetitionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpacedRepetitionItem
        fields = ['topic', 'question_identifier', 'next_review_date', 'interval', 'repetitions']
        read_only_fields = fields

class ProgressTrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressTracker
        fields = ['current_streak', 'longest_streak', 'last_activity_date', 'total_study_minutes', 'total_quizzes_taken']
        read_only_fields = fields

class TopicMasterySerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicMastery
        fields = ['topic', 'subject', 'mastery_score', 'quizzes_taken', 'last_updated']
        read_only_fields = fields
