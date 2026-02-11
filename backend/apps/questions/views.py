from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Question, Answer, QuestionAttempt
from .serializers import (
    QuestionSerializer, QuestionDetailSerializer, 
    GenerateQuestionSerializer, AttemptQuestionSerializer, QuestionAttemptSerializer
)
from .services.question_generator import QuestionGenerationService

class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing questions.
    Standard list/retrieve hides correct answers.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = GenerateQuestionSerializer(data=request.data)
        if serializer.is_valid():
            service = QuestionGenerationService()
            try:
                questions = service.generate_questions(
                    subject_id=serializer.validated_data['subject_id'],
                    topic_id=serializer.validated_data['topic_id'],
                    exam_type_id=serializer.validated_data['exam_type_id'],
                    difficulty=serializer.validated_data['difficulty'],
                    count=serializer.validated_data['count'],
                    question_type=serializer.validated_data['question_type']
                )
                output_serializer = QuestionSerializer(questions, many=True)
                return Response(output_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def attempt(self, request, pk=None):
        """
        Submit an answer for a question. 
        Returns the result and the correct answer explanation.
        """
        question = self.get_object()
        selected_answer_id = request.data.get('selected_answer_id')
        
        try:
            selected_answer = Answer.objects.get(id=selected_answer_id, question=question)
        except Answer.DoesNotExist:
             return Response({'error': 'Invalid answer ID for this question'}, status=status.HTTP_400_BAD_REQUEST)

        is_correct = selected_answer.is_correct
        
        attempt = QuestionAttempt.objects.create(
            user=request.user,
            question=question,
            selected_answer=selected_answer,
            is_correct=is_correct
        )
        
        # Return result with explanation
        return Response({
            'correct': is_correct,
            'explanation': selected_answer.explanation if is_correct else "Incorrect.",
            'correct_answer_id': question.answers.filter(is_correct=True).first().id
        })
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get user statistics for the dashboard.
        """
        user = request.user
        attempts = QuestionAttempt.objects.filter(user=user)
        
        # Overall Stats
        total_questions = attempts.count()
        correct_answers = attempts.filter(is_correct=True).count()
        accuracy = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        # Study Time (sum of time_taken_seconds) / 3600 for hours
        total_seconds = attempts.aggregate(total=models.Sum('time_taken_seconds'))['total'] or 0
        study_hours = round(total_seconds / 3600, 1)

        # Subject Mastery
        # Group by subject and calculate accuracy per subject
        from django.db.models import Count, Avg, Case, When, IntegerField
        
        subject_stats = attempts.values('question__subject__name').annotate(
            total=Count('id'),
            correct=Count(Case(When(is_correct=True, then=1), output_field=IntegerField())),
        ).order_by('-total')[:5]
        
        mastery = []
        for stat in subject_stats:
            subj_total = stat['total']
            subj_correct = stat['correct']
            subj_acc = (subj_correct / subj_total * 100) if subj_total > 0 else 0
            mastery.append({
                'subject': stat['question__subject__name'],
                'progress': round(subj_acc, 1),
                'total_questions': subj_total
            })

        return Response({
            'total_questions': total_questions,
            'accuracy': round(accuracy, 1),
            'study_hours': study_hours,
            'mastery': mastery
        })
