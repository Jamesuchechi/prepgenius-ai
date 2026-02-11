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
        Supports selected_answer_id for MCQ and text_answer for others.
        """
        question = self.get_object()
        selected_answer_id = request.data.get('selected_answer_id')
        text_answer = request.data.get('text_answer')
        
        is_correct = False
        explanation = ""
        
        # 1. MCQ Handling
        if question.question_type == 'MCQ':
            if not selected_answer_id:
                return Response({'error': 'selected_answer_id required for MCQ'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                selected_answer = Answer.objects.get(id=selected_answer_id, question=question)
                is_correct = selected_answer.is_correct
                explanation = selected_answer.explanation if is_correct else "Incorrect."
                # Find the correct answer for feedback
                correct_ans = question.answers.filter(is_correct=True).first()
                if not is_correct and correct_ans:
                    explanation = f"Incorrect. {correct_ans.explanation}"
            except Answer.DoesNotExist:
                 return Response({'error': 'Invalid answer ID'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. TRUE/FALSE Handling
        elif question.question_type == 'TRUE_FALSE':
            if not text_answer:
                 return Response({'error': 'text_answer required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Find the answer object that matches the text (case-insensitive)
            # We stored "True" and "False" as Answer objects
            selected_answer = question.answers.filter(content__iexact=str(text_answer)).first()
            if selected_answer:
                is_correct = selected_answer.is_correct
                explanation = selected_answer.explanation
                if not is_correct:
                    correct = question.answers.filter(is_correct=True).first()
                    if correct: explanation = f"Incorrect. {correct.explanation}"
            else:
                return Response({'error': 'Invalid True/False option'}, status=status.HTTP_400_BAD_REQUEST)

        # 3. FILL_BLANK Handling
        elif question.question_type == 'FILL_BLANK':
             # Simple string match against the correct Answer object
             correct_answer_obj = question.answers.filter(is_correct=True).first()
             if correct_answer_obj:
                 # NormalizeStrings
                 user_ans = str(text_answer).strip().lower()
                 correct_ans = correct_answer_obj.content.strip().lower()
                 is_correct = (user_ans == correct_ans)
                 explanation = correct_answer_obj.explanation
             else:
                 # Fallback if no answer obj
                 is_correct = False
                 explanation = "Error: Correct answer not found in specific database records."

        # 4. MATCHING Handling
        elif question.question_type == 'MATCHING':
            import json
            try:
                user_pairs = json.loads(text_answer) if isinstance(text_answer, str) else text_answer
                # Expected format: [{'item': 'A', 'match': 'B'}, ...]
                # Stored in question.metadata['pairs']
                correct_pairs = question.metadata.get('pairs', [])
                
                # Sort both by 'item' to compare
                user_pairs_sorted = sorted(user_pairs, key=lambda x: x.get('item', ''))
                correct_pairs_sorted = sorted(correct_pairs, key=lambda x: x.get('item', ''))
                
                # Deep compare
                is_correct = (user_pairs_sorted == correct_pairs_sorted)
                explanation = question.guidance or "Check the correct pairs." # Using guidance as general explanation or we could store explanation in metadata
                
                if not explanation and hasattr(question, 'answers'): # Check if answer obj exists
                     ans = question.answers.first()
                     if ans: explanation = ans.explanation

            except Exception as e:
                return Response({'error': f'Invalid JSON format for matching: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # 5. ORDERING Handling
        elif question.question_type == 'ORDERING':
            import json
            try:
                user_seq = json.loads(text_answer) if isinstance(text_answer, str) else text_answer
                correct_seq = question.metadata.get('sequence', [])
                
                is_correct = (user_seq == correct_seq)
                explanation = question.guidance
            except Exception:
                 return Response({'error': 'Invalid format'}, status=status.HTTP_400_BAD_REQUEST)

        # 6. THEORY (AI Grading Placeholder)
        elif question.question_type == 'THEORY':
            # For now, just mark complete/correct or leave for manual/AI grading later
            # We'll return the 'model answer' for self-grading
            correct_answer_obj = question.answers.first()
            is_correct = True # Auto-pass for now or need AI grading
            explanation = correct_answer_obj.explanation if correct_answer_obj else "Self-evaluate against the model answer."
        
        # Save Attempt
        AttemptQuestionSerializer
        attempt = QuestionAttempt.objects.create(
            user=request.user,
            question=question,
            response_data={'text': text_answer, 'id': selected_answer_id},
            is_correct=is_correct,
            score=1.0 if is_correct else 0.0
        )
        
        return Response({
            'correct': is_correct,
            'explanation': explanation,
            'correct_answer_data': self._get_correct_answer_data(question)
        })

    def _get_correct_answer_data(self, question):
        if question.question_type == 'MCQ':
            ans = question.answers.filter(is_correct=True).first()
            return ans.id if ans else None
        elif question.question_type in ['TRUE_FALSE', 'FILL_BLANK']:
             ans = question.answers.filter(is_correct=True).first()
             return ans.content if ans else None
        elif question.question_type == 'MATCHING':
            return question.metadata.get('pairs')
        elif question.question_type == 'ORDERING':
            return question.metadata.get('sequence')
        elif question.question_type == 'THEORY':
             ans = question.answers.first()
             return ans.content if ans else None
        return None

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
