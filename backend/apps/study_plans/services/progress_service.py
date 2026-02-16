
import logging
from django.db import transaction
from django.db.models import Avg

from apps.study_plans.models import StudyTask
from apps.study_plans.services.adjustment_service import StudyPlanAdjustmentService
from apps.questions.models import QuestionAttempt

logger = logging.getLogger(__name__)

class StudyPlanProgressService:
    """Service for tracking and updating study progress based on user activity."""
    
    @staticmethod
    def handle_question_attempt(attempt: QuestionAttempt):
        """
        Update relevant study tasks when a user attempts a question.
        
        Args:
            attempt: The QuestionAttempt instance
        """
        question = attempt.question
        user = attempt.user
        
        # If question has no topic, we can't link it to a generic study plan task easily
        if not question.topic:
            return

        # Find active tasks related to this topic
        # We look for pending, in_progress, or revisit tasks
        # We also look for completed tasks to update mastery (degrading or reinforcing)
        tasks = StudyTask.objects.filter(
            study_plan__user=user,
            topic=question.topic,
            study_plan__status='active'
        )
        
        if not tasks.exists():
            return
            
        logger.info(f"Updating {tasks.count()} tasks for user {user.email} based on question attempt")
        
        for task in tasks:
            StudyPlanProgressService._update_task_mastery(task)
            # After updating mastery, check if we need to schedule adaptive reviews
            StudyPlanAdjustmentService.trigger_adaptive_review(task.study_plan)
            
    @staticmethod
    def _update_task_mastery(task: StudyTask):
        """Calculate and update mastery level for a task."""
        
        # Determine which attempts are relevant
        if task.questions.exists():
            # If task is linked to specific questions, use only those
            attempts = QuestionAttempt.objects.filter(
                question__in=task.questions.all(),
                user=task.study_plan.user
            )
        else:
            # Otherwise use all attempts for the topic
            attempts = QuestionAttempt.objects.filter(
                question__topic=task.topic,
                user=task.study_plan.user
            )
            
        if not attempts.exists():
            return

        # Calculate mastery based on recent performance (last 10 attempts)
        recent_attempts = attempts.order_by('-created_at')[:10]
        total_attempts = len(recent_attempts)
        
        if total_attempts == 0:
            return
            
        # Calculate score percentage
        # If attempt has a score, use it (assuming normalized). If not, use is_correct.
        total_score = 0
        for attempt in recent_attempts:
            if attempt.score > 1: # Assuming score is already 0-100 or similar if > 1
                 total_score += attempt.score
            elif attempt.score > 0: # Assuming 0-1 scale
                 total_score += attempt.score * 100
            else: # Fallback to boolean
                 total_score += 100 if attempt.is_correct else 0
                 
        avg_mastery = total_score / total_attempts
        
        # Update task
        task.understanding_level = int(avg_mastery)
        
        # Auto-start task if it was pending and we have activity
        if task.status == 'pending':
            task.status = 'in_progress'
            task.actual_start_date = task.actual_start_date or attempt.created_at.date()
            
        task.save()
        
        # Update parent plan progress
        task.study_plan.update_progress()
