from rest_framework import serializers
from .models import ProgressTracker, TopicMastery, StudySession, SpacedRepetitionItem

class StudySessionSerializer(serializers.ModelSerializer):
    questions_attempted = serializers.IntegerField(source='questions_answered', read_only=True)
    correct_questions = serializers.IntegerField(source='correct_count', read_only=True)
    duration_seconds = serializers.SerializerMethodField()
    subject_details = serializers.SerializerMethodField()

    class Meta:
        model = StudySession
        fields = [
            'id', 'start_time', 'end_time', 'duration_minutes', 
            'duration_seconds', 'questions_answered', 'questions_attempted',
            'correct_count', 'correct_questions', 'subject', 'subject_details'
        ]
        read_only_fields = fields

    def get_duration_seconds(self, obj):
        return obj.duration_minutes * 60

    def get_subject_details(self, obj):
        return {"name": obj.subject or "Study Session"}

class SpacedRepetitionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpacedRepetitionItem
        fields = ['topic', 'question_identifier', 'next_review_date', 'interval', 'repetitions']
        read_only_fields = fields

class ProgressTrackerSerializer(serializers.ModelSerializer):
    accuracy_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ProgressTracker
        fields = [
            'current_streak',
            'longest_streak',
            'last_activity_date',
            'total_study_minutes',
            'total_quizzes_taken',
            'total_mock_exams_taken',
            'total_questions_attempted',
            'total_correct_answers',
            'tutor_interactions_count',
            'accuracy_percentage',
        ]
        read_only_fields = fields
    
    def get_accuracy_percentage(self, obj):
        return obj.accuracy_percentage

class TopicMasterySerializer(serializers.ModelSerializer):
    topic_details = serializers.SerializerMethodField()
    mastery_percentage = serializers.FloatField(source='mastery_score', read_only=True)
    correct_attempts = serializers.SerializerMethodField()
    total_attempts = serializers.IntegerField(source='quizzes_taken', read_only=True)

    class Meta:
        model = TopicMastery
        fields = [
            'id', 'topic', 'subject', 'mastery_score', 'mastery_percentage',
            'quizzes_taken', 'total_attempts', 'correct_attempts', 
            'last_updated', 'topic_details'
        ]
        read_only_fields = fields

    def get_topic_details(self, obj):
        return {"name": obj.topic}

    def get_correct_attempts(self, obj):
        # Derive an approximate correct count based on mastery score
        return int((obj.mastery_score * obj.quizzes_taken) / 100)
