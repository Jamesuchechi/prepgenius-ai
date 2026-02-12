
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from .models import MockExam, ExamAttempt, ExamResult
from .serializers import (
	MockExamSerializer,
	MockExamDetailSerializer,
	ExamAttemptSerializer,
	ExamResultSerializer,
	ExamSubmissionSerializer
)
from .services.exam_generator import generate_jamb_mock_exam
from .services.exam_generator import generate_mock_exam_by_subject_name
from .services.exam_grader import auto_grade_exam, validate_exam_submission
from .services.result_analyzer import analyze_exam_result, get_exam_statistics

import logging

logger = logging.getLogger(__name__)


class MockExamViewSet(ModelViewSet):
	"""ViewSet for managing mock exams."""
	queryset = MockExam.objects.filter(is_active=True, is_public=True).order_by('-created_at')
	permission_classes = [permissions.IsAuthenticated]
	
	def get_serializer_class(self):
		if self.action == 'retrieve':
			return MockExamDetailSerializer
		return MockExamSerializer
	
	@action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
	def create_jamb_exam(self, request):
		"""
		Create a new JAMB mock exam.
		
		Request body:
		{
			"subject_id": int,
			"exam_type_id": int,
			"num_questions": int (optional, default 60),
			"duration_minutes": int (optional, default 60),
			"difficulty_distribution": dict (optional)
		}
		"""
		try:
			subject_id = request.data.get('subject_id')
			exam_type_id = request.data.get('exam_type_id')
			num_questions = request.data.get('num_questions', 60)
			duration_minutes = request.data.get('duration_minutes', 60)
			difficulty_distribution = request.data.get('difficulty_distribution')
			
			if not subject_id or not exam_type_id:
				return Response(
					{'error': 'subject_id and exam_type_id are required'},
					status=status.HTTP_400_BAD_REQUEST
				)
			
			mock_exam = generate_jamb_mock_exam(
				subject_id=subject_id,
				exam_type_id=exam_type_id,
				num_questions=num_questions,
				duration_minutes=duration_minutes,
				creator=request.user,
				difficulty_distribution=difficulty_distribution
			)
			
			serializer = self.get_serializer(mock_exam)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		
		except ValueError as e:
			logger.error(f"Error creating JAMB exam: {str(e)}")
			return Response(
				{'error': str(e)},
				status=status.HTTP_400_BAD_REQUEST
			)
		except Exception as e:
			logger.error(f"Unexpected error creating JAMB exam: {str(e)}")
			return Response(
				{'error': 'An unexpected error occurred'},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)
	
	@action(detail=True, methods=['get'])
	def stats(self, request, pk=None):
		"""Get overall statistics for a mock exam."""
		mock_exam = self.get_object()
		stats = get_exam_statistics(mock_exam)
		return Response(stats)

	@action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
	def create_exam(self, request):
		"""
		Create a mock exam by subject name and mode.
		
		For 'past_questions' mode:
		{
			"subject_name": "Biology",
			"exam_format": "JAMB",
			"mode": "past_questions",
			"year": 2023
		}
		
		For 'ai_generated' mode:
		{
			"subject_name": "Biology",
			"exam_format": "JAMB",
			"mode": "ai_generated",
			"num_questions": 60,
			"duration_minutes": 60,
			"difficulty_distribution": {"EASY": 20, "MEDIUM": 60, "HARD": 20}
		}
		"""
		try:
			subject_name = request.data.get('subject_name')
			mode = request.data.get('mode', 'ai_generated')
			exam_format = request.data.get('exam_format', 'JAMB')
			
			if not subject_name:
				return Response({'error': 'subject_name is required'}, status=status.HTTP_400_BAD_REQUEST)
			
			if not exam_format:
				return Response({'error': 'exam_format is required'}, status=status.HTTP_400_BAD_REQUEST)

			if mode == 'past_questions':
				year = int(request.data.get('year', 0))
				if year <= 0:
					return Response({'error': 'year is required for past_questions mode'}, status=status.HTTP_400_BAD_REQUEST)
				
				mock_exam = generate_mock_exam_by_subject_name(
					subject_name=subject_name,
					exam_format=exam_format,
					mode='past_questions',
					year=year,
					creator=request.user
				)
			else:
				# ai_generated mode (default)
				num_questions = int(request.data.get('num_questions', 60))
				duration_minutes = int(request.data.get('duration_minutes', 60))
				difficulty_distribution = request.data.get('difficulty_distribution')

				mock_exam = generate_mock_exam_by_subject_name(
					subject_name=subject_name,
					exam_format=exam_format,
					num_questions=num_questions,
					duration_minutes=duration_minutes,
					creator=request.user,
					difficulty_distribution=difficulty_distribution,
					mode='ai_generated'
				)

			serializer = self.get_serializer(mock_exam)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		except ValueError as e:
			logger.error(f"Error creating exam: {str(e)}")
			return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			logger.error(f"Unexpected error creating exam: {str(e)}")
			return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExamStartView(generics.CreateAPIView):
	"""Start an exam attempt."""
	serializer_class = ExamAttemptSerializer
	permission_classes = [permissions.IsAuthenticated]
	lookup_field = 'pk'
	lookup_url_kwarg = 'exam_id'
	
	def create(self, request, exam_id=None, *args, **kwargs):
		"""
		Start a new exam attempt.
		If user already has an attempt for this exam, return the existing one.
		"""
		try:
			mock_exam = get_object_or_404(MockExam, pk=exam_id, is_active=True)
			
			# Check if user already has an active attempt (only resume IN_PROGRESS)
			existing_attempt = ExamAttempt.objects.filter(
				user=request.user,
				mock_exam=mock_exam,
				status='IN_PROGRESS'
			).first()

			if existing_attempt:
				logger.info(f"User {request.user.id} resuming existing exam attempt {existing_attempt.id}")
				serializer = self.get_serializer(existing_attempt)
				return Response(serializer.data, status=status.HTTP_200_OK)
			
			# Create new attempt
			from django.db import IntegrityError
			try:
				attempt = ExamAttempt.objects.create(
					user=request.user,
					mock_exam=mock_exam,
					status='IN_PROGRESS',
					ip_address=self.get_client_ip(request),
					user_agent=request.META.get('HTTP_USER_AGENT', '')
				)
			except IntegrityError:
				# Unique constraint exists in DB; fallback to reuse latest attempt (reset for retake)
				existing = ExamAttempt.objects.filter(user=request.user, mock_exam=mock_exam).order_by('-started_at').first()
				if not existing:
					raise
				# Reset fields to allow a retake (overwrite previous attempt)
				existing.started_at = timezone.now()
				existing.completed_at = None
				existing.time_taken_seconds = 0
				existing.is_submitted = False
				existing.status = 'IN_PROGRESS'
				existing.score = 0.0
				existing.percentage = 0.0
				existing.raw_responses = {}
				existing.auto_graded = False
				existing.attempted_questions = 0
				existing.ip_address = self.get_client_ip(request)
				existing.user_agent = request.META.get('HTTP_USER_AGENT', '')
				existing.save()
				attempt = existing
			
			logger.info(f"User {request.user.id} started exam {mock_exam.id}, attempt {attempt.id}")
			serializer = self.get_serializer(attempt)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		
		except MockExam.DoesNotExist:
			return Response(
				{'error': 'Exam not found'},
				status=status.HTTP_404_NOT_FOUND
			)
		except Exception as e:
			logger.error(f"Error starting exam: {str(e)}")
			return Response(
				{'error': 'An error occurred while starting the exam'},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)
	
	def get_client_ip(self, request):
		"""Get client IP address from request."""
		x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
		if x_forwarded_for:
			ip = x_forwarded_for.split(',')[0]
		else:
			ip = request.META.get('REMOTE_ADDR')
		return ip


class ExamSubmitView(generics.UpdateAPIView):
	"""Submit exam responses and trigger auto-grading."""
	serializer_class = ExamSubmissionSerializer
	permission_classes = [permissions.IsAuthenticated]
	lookup_field = 'pk'
	lookup_url_kwarg = 'exam_id'
	
	def update(self, request, exam_id=None, *args, **kwargs):
		"""
		Submit exam answers.
		
		Request body:
		{
			"raw_responses": dict,  # question_id -> answer_id
			"time_taken_seconds": int
		}
		"""
		try:
			mock_exam = get_object_or_404(MockExam, pk=exam_id)
			attempt = get_object_or_404(
				ExamAttempt,
				user=request.user,
				mock_exam=mock_exam,
				status__in=['IN_PROGRESS', 'SUBMITTED']
			)
			
			# Get submission data
			raw_responses = request.data.get('raw_responses', {})
			time_taken_seconds = request.data.get('time_taken_seconds', 0)
			
			if not raw_responses:
				return Response(
					{'error': 'raw_responses are required'},
					status=status.HTTP_400_BAD_REQUEST
				)
			
			# Validate submission (timer and responses)
			validation = validate_exam_submission(attempt, time_taken_seconds)
			
			# Update attempt with submission data
			attempt.raw_responses = raw_responses
			attempt.time_taken_seconds = time_taken_seconds
			attempt.mark_submitted()
			
			# Auto-grade the exam
			grading_result = auto_grade_exam(attempt)
			
			# Analyze and generate result
			result = analyze_exam_result(attempt, grading_result)
			
			logger.info(
				f"Exam submitted and graded for user {request.user.id}, "
				f"attempt {attempt.id}: {attempt.percentage:.1f}%"
			)
			
			# Return results
			response_data = {
				'attempt': ExamAttemptSerializer(attempt).data,
				'result': ExamResultSerializer(result).data,
				'validation': validation
			}
			
			return Response(response_data, status=status.HTTP_200_OK)
		
		except ExamAttempt.DoesNotExist:
			return Response(
				{'error': 'Exam attempt not found'},
				status=status.HTTP_404_NOT_FOUND
			)
		except Exception as e:
			logger.error(f"Error submitting exam: {str(e)}")
			return Response(
				{'error': 'An error occurred during submission'},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)

	def post(self, request, exam_id=None, *args, **kwargs):
		"""Allow POST to submit endpoint (frontend uses POST). Delegate to update()."""
		return self.update(request, exam_id=exam_id, *args, **kwargs)


class ExamResultView(generics.RetrieveAPIView):
	"""Get exam result and detailed analysis."""
	serializer_class = ExamResultSerializer
	permission_classes = [permissions.IsAuthenticated]
	lookup_field = 'pk'
	lookup_url_kwarg = 'exam_id'
	
	def get_object(self):
		"""Get the result for the user's attempt."""
		try:
			attempt = get_object_or_404(
				ExamAttempt,
				user=self.request.user,
				mock_exam_id=self.kwargs['exam_id']
			)
			return attempt.result
		except ExamResult.DoesNotExist:
			raise ExamResult.DoesNotExist(
				"No result found. Please submit the exam first."
			)


class MyExamAttemptsView(generics.ListAPIView):
	"""Get user's exam attempts."""
	serializer_class = ExamAttemptSerializer
	permission_classes = [permissions.IsAuthenticated]
	
	def get_queryset(self):
		"""Get all exam attempts for the current user."""
		return ExamAttempt.objects.filter(
			user=self.request.user
		).select_related('mock_exam').order_by('-started_at')


class ExamAttemptDetailView(generics.RetrieveAPIView):
	"""Get detailed information about a specific exam attempt."""
	serializer_class = ExamAttemptSerializer
	permission_classes = [permissions.IsAuthenticated]
	lookup_field = 'pk'
	lookup_url_kwarg = 'attempt_id'
	
	def get_queryset(self):
		"""Only allow users to view their own attempts."""
		return ExamAttempt.objects.filter(user=self.request.user)


class MockExamCreateView(generics.CreateAPIView):
	"""Create a new mock exam (legacy endpoint)."""
	queryset = MockExam.objects.all()
	serializer_class = MockExamSerializer
	permission_classes = [permissions.IsAuthenticated]

	def perform_create(self, serializer):
		serializer.save(creator=self.request.user)


class MockExamListView(generics.ListAPIView):
	"""List all available mock exams (legacy endpoint)."""
	queryset = MockExam.objects.filter(is_active=True, is_public=True).order_by('-created_at')
	serializer_class = MockExamSerializer
	permission_classes = [permissions.IsAuthenticated]
