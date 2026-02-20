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
from django_q.tasks import async_task
from django_q.models import Task

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
        
        # Resolve Subject
        subject_id = data.get('subject_id')
        subject_obj = None
        if subject_id:
            from apps.content.models import Subject
            subject_obj = get_object_or_404(Subject, id=subject_id)

        try:
            # Enqueue to background worker instead of blocking HTTP request
            task_id = async_task(
                'apps.quiz.tasks.generate_quiz_async',
                user_id=request.user.id,
                subject_id=subject_obj.id if subject_obj else None,
                topic=data['topic'],
                difficulty=data['difficulty'],
                question_count=data['question_count'],
                question_type=data['exam_type'],
                document_id=data.get('document_id')
            )
            return Response({"task_id": task_id, "status": "processing"}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def generate_status(self, request):
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response({"error": "task_id required"}, status=400)
            
        task = Task.objects.filter(id=task_id).first()
        if not task:
            # Task might be in queue or very recently created
            return Response({"status": "processing"})
            
        if task.success:
            result = task.result
            if isinstance(result, dict) and result.get("status") == "success":
                quiz = Quiz.objects.get(id=result["quiz_id"])
                return Response({
                    "status": "success",
                    "quiz": QuizSerializer(quiz).data
                })
            else:
                return Response({"status": "failed", "error": result.get("error", "Unknown error")})
        else:
            return Response({"status": "failed", "error": "Task execution failed"})

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
            selected_answer_id = ans_data.get('selected_answer_id')
            text_response = ans_data.get('text_response')
            is_correct = False
            feedback = ""
            
            # Grading Logic (Simple MCQ)
            # Grading Logic (Simple MCQ)
            if question.question_type == 'MCQ':
                # Find correct answer in DB
                correct_answer_obj = question.answers.filter(is_correct=True).first()
                if correct_answer_obj:
                     # Check by ID if provided, otherwise fallback to content matching
                     if selected_answer_id:
                         if int(selected_answer_id) == correct_answer_obj.id:
                             is_correct = True
                     
                     if not is_correct and selected_option:
                         # Normalize strings for comparison
                         sel_norm = selected_option.strip().lower()
                         cor_norm = correct_answer_obj.content.strip().lower()
                         
                         if sel_norm == cor_norm:
                             is_correct = True
                         elif cor_norm.startswith(sel_norm) and len(sel_norm) > 1: # Strict prefix match
                             is_correct = True
                         
                     if is_correct:
                         correct_count += 1
                         feedback = "Correct! " + correct_answer_obj.explanation
                     else:
                         feedback = f"Incorrect. The correct answer was: {correct_answer_obj.content}. {correct_answer_obj.explanation}"
                else:
                    # Fallback if no correct answer is marked in DB
                    feedback = "Error: Correct answer not defined in system. Please report this."
            
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
