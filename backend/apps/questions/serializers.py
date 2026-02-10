from rest_framework import serializers
from .models import Question, Answer, QuestionAttempt

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'content', 'is_correct', 'explanation']
        extra_kwargs = {
            'is_correct': {'write_only': True}, # Hide correctness by default
            'explanation': {'write_only': True} # Hide explanation by default
        }

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'subject', 'topic', 'exam_type', 'content', 'question_type', 'difficulty', 'answers']

# Serializer for FULL details (after attempt)
class QuestionDetailSerializer(serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'content', 'answers', 'guidance']

    def get_answers(self, obj):
        # Override to show all fields including is_correct
        class FullAnswerSerializer(serializers.ModelSerializer):
            class Meta:
                model = Answer
                fields = ['id', 'content', 'is_correct', 'explanation']
        return FullAnswerSerializer(obj.answers.all(), many=True).data

class GenerateQuestionSerializer(serializers.Serializer):
    subject_id = serializers.IntegerField()
    topic_id = serializers.IntegerField()
    exam_type_id = serializers.IntegerField()
    difficulty = serializers.ChoiceField(choices=['EASY', 'MEDIUM', 'HARD'], default='MEDIUM')
    count = serializers.IntegerField(default=5, max_value=20)

class AttemptQuestionSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_answer_id = serializers.IntegerField()

class QuestionAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAttempt
        fields = '__all__'
