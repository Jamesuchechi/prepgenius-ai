from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Quiz, QuizAttempt, AnswerAttempt
from .serializers import (
    QuizSerializer, QuizListSerializer, QuizGenerationSerializer, 
    QuizSubmissionSerializer, QuizAttemptSerializer
)
from .services import QuizService
from apps.questions.models import Question, Answer

class QuizViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_queryset(self):
        return Quiz.objects.filter(created_by=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return QuizListSerializer
        return QuizSerializer

    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = QuizGenerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        try:
            quiz = QuizService.generate_quiz(
                user=request.user,
                subject=data.get('subject_id'), # TODO: Fetch generic 'General' subject if None? Or modify Service to handle None.
                topic=data['topic'],
                difficulty=data['difficulty'],
                question_count=data['question_count'],
                question_type=data['exam_type'], # Map API 'exam_type' to service 'question_type'
                document_id=data.get('document_id')
            )
            return Response(QuizSerializer(quiz).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        quiz = self.get_object()
        serializer = QuizSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        submission_data = serializer.validated_data['answers']
        
        # Create Attempt
        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            total_questions=quiz.questions.count(),
            status='COMPLETED',
            completed_at=timezone.now()
        )
        
        correct_count = 0
        score = 0
        
        # Process answers
        # Currently simple linear grading
        question_map = {q.id: q for q in quiz.questions.all()}
        
        for ans_data in submission_data:
            q_id = ans_data['question_id']
            question = question_map.get(q_id)
            if not question:
                continue
                
            selected_option = ans_data.get('selected_option')
            text_response = ans_data.get('text_response')
            is_correct = False
            feedback = ""
            
            # Grading Logic (Simple MCQ)
            if question.question_type == 'MCQ':
                # Find correct answer in DB
                correct_answer_obj = question.answers.filter(is_correct=True).first()
                if correct_answer_obj:
                     # Check if selected option matches content or metadata
                     # Since we store "A. Option Text", matching might be tricky if frontend sends just "A" or the full text.
                     # Let's assume frontend sends the full text found in Answer.content for now, or we implement ID matching.
                     # Ideally we should expose Answer IDs and frontend submits Answer ID.
                     
                     # Check if selected_option matches content directly
                     if selected_option == correct_answer_obj.content:
                         is_correct = True
                     # Or check if startswith (careful with partial matches)
                     elif selected_option and correct_answer_obj.content.startswith(selected_option):
                         is_correct = True
                         
                     if is_correct:
                         correct_count += 1
                         feedback = "Correct! " + correct_answer_obj.explanation
                     else:
                         feedback = f"Incorrect. The correct answer was: {correct_answer_obj.content}. {correct_answer_obj.explanation}"
            
            # Save AnswerAttempt
            AnswerAttempt.objects.create(
                quiz_attempt=attempt,
                question=question,
                selected_option=selected_option,
                text_response=text_response,
                is_correct=is_correct,
                feedback=feedback
            )
            
        attempt.correct_answers = correct_count
        if attempt.total_questions > 0:
            attempt.score = (correct_count / attempt.total_questions) * 100
        attempt.save()
        
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_200_OK)

class QuizAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = QuizAttemptSerializer

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).order_by('-started_at')
