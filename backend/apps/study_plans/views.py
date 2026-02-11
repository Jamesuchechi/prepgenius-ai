from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, NotFound
from django.utils import timezone
from django.db.models import Q, Avg, Count
from django.shortcuts import get_object_or_404

from .models import StudyPlan, StudyTask, StudyReminder, AdjustmentHistory
from .serializers import (
    StudyPlanListSerializer,
    StudyPlanDetailedSerializer,
    StudyPlanCreateSerializer,
    StudyPlanUpdateSerializer,
    StudyTaskSerializer,
    StudyTaskCreateSerializer,
    StudyTaskUpdateSerializer,
    StudyTaskCompleteSerializer,
    StudySessionLogSerializer,
    StudyReminderSerializer,
    PerformanceBasedAdjustmentSerializer,
    AdjustmentHistorySerializer,
    StudyStatisticsSerializer,
)
from .services import StudyPlanGenerationService, StudyPlanAdjustmentService
from apps.content.models import ExamType, Subject
import logging

logger = logging.getLogger(__name__)


class StudyPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing study plans.
    
    Endpoints:
    - POST /api/study-plans/generate/ - Generate new AI study plan
    - GET /api/study-plans/ - List all study plans
    - GET /api/study-plans/current/ - Get current active plan
    - GET /api/study-plans/{id}/ - Get detailed plan
    - PATCH /api/study-plans/{id}/ - Update plan
    - DELETE /api/study-plans/{id}/ - Delete plan
    - GET /api/study-plans/{id}/statistics/ - Get plan statistics
    - POST /api/study-plans/{id}/adjust/ - Request performance-based adjustment
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'exam_type__name']
    ordering_fields = ['created_at', 'exam_date', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return study plans for the authenticated user."""
        return StudyPlan.objects.filter(user=self.request.user).prefetch_related(
            'tasks', 'reminders', 'adjustments', 'subjects'
        )
    
    def get_serializer_class(self):
        """Choose serializer based on action."""
        if self.action == 'create':
            return StudyPlanCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StudyPlanUpdateSerializer
        elif self.action in ['retrieve', 'statistics']:
            return StudyPlanDetailedSerializer
        return StudyPlanListSerializer
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate a new AI-based study plan.
        
        Request body:
        {
            "exam_type_id": 1,
            "exam_date": "2025-04-15",
            "subject_ids": [1, 2, 3],
            "study_hours_per_day": 2.5,
            "study_days_per_week": 6,
            "difficulty_preference": "intermediate",
            "include_weekends": true,
            "name": "Custom Plan Name" (optional)
        }
        """
        
        try:
            # Validate required fields
            exam_type_id = request.data.get('exam_type_id')
            exam_date = request.data.get('exam_date')
            subject_ids = request.data.get('subject_ids', [])
            
            if not exam_type_id or not exam_date or not subject_ids:
                raise ValidationError(
                    "exam_type_id, exam_date, and subject_ids are required"
                )
            
            # Get exam type
            try:
                exam_type = ExamType.objects.get(id=exam_type_id)
            except ExamType.DoesNotExist:
                raise NotFound(f"ExamType with id {exam_type_id} not found")
            
            # Get subjects
            subjects = Subject.objects.filter(id__in=subject_ids)
            if subjects.count() != len(subject_ids):
                raise NotFound("One or more subjects not found")
            
            # Parse exam date
            from datetime import datetime
            try:
                exam_date_obj = datetime.strptime(exam_date, '%Y-%m-%d').date()
                if exam_date_obj <= timezone.now().date():
                    raise ValidationError("Exam date must be in the future")
            except ValueError:
                raise ValidationError("Invalid exam_date format. Use YYYY-MM-DD")
            
            # Get parameters
            study_hours = float(request.data.get('study_hours_per_day', 2.5))
            study_days = int(request.data.get('study_days_per_week', 6))
            difficulty = request.data.get('difficulty_preference', 'intermediate')
            include_weekends = request.data.get('include_weekends', True)
            plan_name = request.data.get('name')
            
            # Validate parameters
            if study_hours <= 0 or study_hours > 12:
                raise ValidationError("study_hours_per_day must be between 0 and 12")
            if study_days <= 0 or study_days > 7:
                raise ValidationError("study_days_per_week must be between 1 and 7")
            if difficulty not in ['beginner', 'intermediate', 'advanced']:
                raise ValidationError("difficulty_preference must be beginner, intermediate, or advanced")
            
            # Generate study plan
            service = StudyPlanGenerationService()
            study_plan, tasks = service.generate_study_plan(
                user=request.user,
                exam_type=exam_type,
                exam_date=exam_date_obj,
                subjects=list(subjects),
                study_hours_per_day=study_hours,
                study_days_per_week=study_days,
                difficulty_preference=difficulty,
                include_weekends=include_weekends,
                plan_name=plan_name
            )
            
            serializer = StudyPlanDetailedSerializer(study_plan)
            return Response(
                {
                    'message': 'Study plan generated successfully',
                    'study_plan': serializer.data,
                    'tasks_count': len(tasks)
                },
                status=status.HTTP_201_CREATED
            )
            
        except (ValidationError, NotFound) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error generating study plan: {e}")
            return Response(
                {'error': 'Failed to generate study plan. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the user's current active study plan."""
        
        # Try to get active plan
        active_plan = StudyPlan.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        if not active_plan:
            # If no active plan, get the most recent one
            active_plan = StudyPlan.objects.filter(
                user=request.user
            ).order_by('-created_at').first()
        
        if not active_plan:
            return Response(
                {'message': 'No study plan found. Generate one using the /generate/ endpoint.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = StudyPlanDetailedSerializer(active_plan)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a study plan."""
        
        study_plan = self.get_object()
        
        # Deactivate other active plans
        StudyPlan.objects.filter(
            user=request.user,
            status='active'
        ).update(status='paused')
        
        # Activate this plan
        study_plan.status = 'active'
        study_plan.save()
        
        serializer = StudyPlanDetailedSerializer(study_plan)
        return Response(
            {'message': 'Study plan activated', 'study_plan': serializer.data},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a study plan."""
        
        study_plan = self.get_object()
        study_plan.status = 'paused'
        study_plan.save()
        
        return Response({
            'message': 'Study plan paused',
            'status': study_plan.status
        })
    
    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused study plan."""
        
        study_plan = self.get_object()
        if study_plan.status != 'paused':
            raise ValidationError(f"Can only resume paused plans. Current status: {study_plan.status}")
        
        study_plan.status = 'active'
        study_plan.save()
        
        return Response({
            'message': 'Study plan resumed',
            'status': study_plan.status
        })
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for a study plan."""
        
        study_plan = self.get_object()
        tasks = study_plan.tasks.all()
        
        # Calculate statistics
        total_study_hours = study_plan.actual_study_hours or 0
        days_since_start = (timezone.now().date() - study_plan.start_date).days
        average_daily_hours = (
            total_study_hours / max(1, days_since_start)
            if days_since_start > 0
            else 0
        )
        
        completed_tasks = tasks.filter(status='completed').count()
        in_progress_tasks = tasks.filter(status='in_progress').count()
        pending_tasks = tasks.filter(status='pending').count()
        
        # Average understanding
        avg_understanding = tasks.filter(
            status='completed'
        ).aggregate(avg=Avg('understanding_level'))['avg'] or 0
        
        # Estimate remaining hours
        remaining_tasks = tasks.filter(status__in=['pending', 'in_progress'])
        estimated_remaining = sum(t.get_time_remaining_hours() for t in remaining_tasks)
        
        stats = {
            'total_study_hours': round(total_study_hours, 2),
            'average_daily_hours': round(average_daily_hours, 2),
            'completion_percentage': round(study_plan.get_completion_percentage(), 1),
            'topics_completed': completed_tasks,
            'topics_in_progress': in_progress_tasks,
            'topics_pending': pending_tasks,
            'average_understanding': round(avg_understanding, 1),
            'on_track': study_plan.is_on_track(),
            'days_until_exam': study_plan.days_until_exam(),
            'estimated_hours_remaining': round(estimated_remaining, 2),
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def adjust(self, request, pk=None):
        """
        Request a performance-based adjustment to the study plan.
        
        Request body:
        {
            "reason": "behind_schedule",
            "details": "I've been unable to commit as much time as planned"
        }
        """
        
        study_plan = self.get_object()
        serializer = PerformanceBasedAdjustmentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reason = serializer.validated_data['reason']
            
            # Map reasons to performance data
            performance_data = {
                'too_easy': {'mastery_score': 90},
                'too_difficult': {'mastery_score': 30},
                'behind_schedule': {'pace_ratio': 0.6},
                'ahead_of_schedule': {'pace_ratio': 1.5},
                'weak_performance': {'mastery_score': 35},
                'strong_performance': {'mastery_score': 88},
                'time_constraint': {'pace_ratio': 0.7},
                'need_review': {'mastery_score': 50},
            }.get(reason, {})
            
            # Perform adjustment
            adjustment = StudyPlanAdjustmentService.adjust_plan_for_performance(
                study_plan,
                performance_data
            )
            
            if adjustment:
                message = f"Study plan adjusted: {adjustment.get_adjustment_type_display()}"
                return Response({
                    'message': message,
                    'adjustment': AdjustmentHistorySerializer(adjustment).data
                })
            else:
                return Response({
                    'message': 'No adjustments needed at this time'
                })
            
        except Exception as e:
            logger.error(f"Error adjusting study plan: {e}")
            return Response(
                {'error': 'Failed to adjust study plan'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudyTaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing study tasks.
    
    Endpoints:
    - GET /api/study-tasks/ - List all tasks
    - GET /api/study-tasks/{id}/ - Get task details
    - PATCH /api/study-tasks/{id}/ - Update task
    - POST /api/study-tasks/{id}/complete/ - Mark task as complete
    - POST /api/study-tasks/{id}/log-session/ - Log study session
    - POST /api/study-tasks/{id}/start/ - Start task
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['topic__name', 'subject__name']
    ordering_fields = ['scheduled_start_date', 'priority', 'status']
    ordering = ['scheduled_start_date']
    
    def get_queryset(self):
        """Return tasks for current user's study plans."""
        return StudyTask.objects.filter(
            study_plan__user=self.request.user
        ).select_related('study_plan', 'subject', 'topic')
    
    def get_serializer_class(self):
        """Choose serializer based on action."""
        if self.action == 'create':
            return StudyTaskCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return StudyTaskUpdateSerializer
        elif self.action == 'complete':
            return StudyTaskCompleteSerializer
        elif self.action == 'log_session':
            return StudySessionLogSerializer
        return StudyTaskSerializer
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark a task as completed.
        
        Request body:
        {
            "understanding_level": 85,
            "notes": "Completed all questions and reviewed solutions"
        }
        """
        
        task = self.get_object()
        serializer = StudyTaskCompleteSerializer(
            task,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Task marked as completed',
                'task': StudyTaskSerializer(task).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a task (mark as in_progress)."""
        
        task = self.get_object()
        
        if task.status not in ['pending', 'in_progress']:
            raise ValidationError(
                f"Can only start pending or in-progress tasks. Current status: {task.status}"
            )
        
        task.mark_in_progress()
        
        return Response({
            'message': 'Task started',
            'task': StudyTaskSerializer(task).data
        })
    
    @action(detail=True, methods=['post'])
    def log_session(self, request, pk=None):
        """
        Log a study session for this task.
        
        Request body:
        {
            "duration_seconds": 3600,
            "understanding_level": 75,
            "notes": "Covered topics 1-5"
        }
        """
        
        task = self.get_object()
        serializer = StudySessionLogSerializer(
            task,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Study session logged',
                'task': StudyTaskSerializer(task).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def skip(self, request, pk=None):
        """Skip a task."""
        
        task = self.get_object()
        task.status = 'skipped'
        task.save()
        
        return Response({
            'message': 'Task skipped',
            'task': StudyTaskSerializer(task).data
        })
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending tasks."""
        
        tasks = self.get_queryset().filter(status='pending').order_by('scheduled_start_date')
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = StudyTaskSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = StudyTaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get all overdue tasks."""
        
        tasks = self.get_queryset().filter(
            status__in=['pending', 'in_progress'],
            scheduled_end_date__lt=timezone.now().date()
        ).order_by('scheduled_end_date')
        
        page = self.paginate_queryset(tasks)
        if page is not None:
            serializer = StudyTaskSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = StudyTaskSerializer(tasks, many=True)
        return Response(serializer.data)


class StudyReminderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing study reminders.
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = StudyReminderSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['scheduled_datetime']
    ordering = ['scheduled_datetime']
    
    def get_queryset(self):
        """Return reminders for the current user."""
        return StudyReminder.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending reminders that should be sent."""
        
        reminders = self.get_queryset().filter(
            is_active=True,
            scheduled_datetime__lte=timezone.now()
        ).order_by('scheduled_datetime')
        
        serializer = self.get_serializer(reminders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_sent(self, request, pk=None):
        """Mark a reminder as sent."""
        
        reminder = self.get_object()
        reminder.mark_sent()
        
        return Response({
            'message': 'Reminder marked as sent',
            'last_sent': reminder.last_sent
        })
