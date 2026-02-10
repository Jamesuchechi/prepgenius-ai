from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
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
                    count=serializer.validated_data['count']
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
