from rest_framework import serializers
from .models import ProgressTracker, TopicMastery

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
