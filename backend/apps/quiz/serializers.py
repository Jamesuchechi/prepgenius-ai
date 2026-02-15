from rest_framework import serializers
from .models import Quiz, QuizAttempt, AnswerAttempt
from apps.questions.models import Question, Answer
from apps.study_tools.models import Document

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'content'] # Don't expose is_correct in quiz view

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'content', 'question_type', 'answers']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'subject', 'topic', 'difficulty', 'created_at', 'questions', 'question_count']
        read_only_fields = ['created_by', 'questions']

    def get_question_count(self, obj):
        return obj.questions.count()

class QuizListSerializer(serializers.ModelSerializer):
    """Lighter serializer for lists (no questions)"""
    question_count = serializers.SerializerMethodField()
    attempts_count = serializers.SerializerMethodField()
    avg_score = serializers.SerializerMethodField()
    last_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'topic', 'difficulty', 'created_at', 'question_count', 'attempts_count', 'avg_score', 'last_score']

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_attempts_count(self, obj):
        return obj.attempts.filter(user=self.context['request'].user).count()

    def get_avg_score(self, obj):
        from django.db.models import Avg
        attempts = obj.attempts.filter(user=self.context['request'].user, status='COMPLETED')
        if not attempts.exists():
            return None
        avg = attempts.aggregate(Avg('score'))['score__avg']
        return round(avg, 1) if avg is not None else None

    def get_last_score(self, obj):
        attempt = obj.attempts.filter(user=self.context['request'].user, status='COMPLETED').order_by('-completed_at').first()
        return round(attempt.score, 1) if attempt else None

class QuizGenerationSerializer(serializers.Serializer):
    topic = serializers.CharField(required=True)
    difficulty = serializers.ChoiceField(choices=Quiz.DIFFICULTY_LEVELS, default='MEDIUM')
    question_count = serializers.IntegerField(default=5, min_value=1, max_value=20)
    exam_type = serializers.CharField(default="MCQ")
    subject_id = serializers.IntegerField(required=False, allow_null=True)
    document_id = serializers.CharField(required=False, allow_null=True) # UUID string

class AnswerSubmissionSerializer(serializers.Serializer):
    question_id = serializers.IntegerField(required=True)
    selected_option = serializers.CharField(required=False, allow_blank=True)
    selected_answer_id = serializers.IntegerField(required=False, allow_null=True)
    text_response = serializers.CharField(required=False, allow_blank=True)

class QuizSubmissionSerializer(serializers.Serializer):
    answers = AnswerSubmissionSerializer(many=True)

class AnswerAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerAttempt
        fields = ['question', 'selected_option', 'text_response', 'is_correct', 'feedback']

class QuizAttemptSerializer(serializers.ModelSerializer):
    answers = AnswerAttemptSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'score', 'total_questions', 'correct_answers', 'status', 'started_at', 'completed_at', 'answers']
