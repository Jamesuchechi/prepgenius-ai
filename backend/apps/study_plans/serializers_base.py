from rest_framework import serializers
from .models import StudyPlanAssessment

class StudyPlanAssessmentSerializer(serializers.ModelSerializer):
    """Serializer for milestone assessments."""
    quiz_details = serializers.SerializerMethodField()
    is_passed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = StudyPlanAssessment
        fields = [
            'id', 
            'assessment_type', 
            'quiz', 
            'quiz_details', 
            'last_attempt', 
            'passing_score', 
            'is_passed', 
            'created_at'
        ]
        
    def get_quiz_details(self, obj):
        """Lazy-load quiz details to avoid circular imports."""
        from apps.quiz.serializers import QuizListSerializer
        return QuizListSerializer(obj.quiz).data
