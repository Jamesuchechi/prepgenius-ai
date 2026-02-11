"""
Signals for the study_plans app.
Handles automatic updates and notifications.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
import logging

from .models import StudyTask, StudyPlan, StudyReminder, AdjustmentHistory

logger = logging.getLogger(__name__)


@receiver(post_save, sender=StudyTask)
def update_study_plan_progress(sender, instance, created, **kwargs):
    """Update study plan progress when a task changes."""
    
    try:
        study_plan = instance.study_plan
        study_plan.update_progress()
        
        # Invalidate cache
        cache.delete(f'study_plan_{study_plan.id}_progress')
        
    except Exception as e:
        logger.error(f"Error updating study plan progress: {e}")


@receiver(post_save, sender=StudyTask)
def notify_task_completion(sender, instance, created, **kwargs):
    """Send notification when task is completed."""
    
    # Only on completion status change
    if instance.status != 'completed':
        return
    
    try:
        user = instance.study_plan.user
        
        # Send notification email
        send_task_completion_notification(user, instance)
        
        # Log analytics
        logger.info(
            f"User {user.email} completed task: {instance.topic.name} "
            f"with understanding level {instance.understanding_level}%"
        )
        
    except Exception as e:
        logger.error(f"Error notifying task completion: {e}")


@receiver(post_save, sender=StudyPlan)
def initialize_study_plan(sender, instance, created, **kwargs):
    """Initialize study plan when created."""
    
    if not created:
        return
    
    try:
        # Estimate completion date if not set
        if instance.exam_date and not instance.estimated_completion_date:
            # Estimate: 2 weeks before exam for final revision
            instance.estimated_completion_date = instance.exam_date - timezone.timedelta(days=14)
            instance.save()
        
        logger.info(f"Study plan {instance.id} initialized for user {instance.user.email}")
        
    except Exception as e:
        logger.error(f"Error initializing study plan: {e}")


@receiver(post_save, sender=AdjustmentHistory)
def log_adjustment_notification(sender, instance, created, **kwargs):
    """Log when a study plan is adjusted."""
    
    if not created:
        return
    
    try:
        user = instance.study_plan.user
        
        message = (
            f"Your study plan '{instance.study_plan.name}' was adjusted: "
            f"{instance.adjustment_type} - {instance.reason}"
        )
        
        logger.info(f"User {user.email}: {message}")
        
        # Could send email notification here
        # send_adjustment_notification(user, instance)
        
    except Exception as e:
        logger.error(f"Error logging adjustment notification: {e}")


def send_task_completion_notification(user, task):
    """Send email notification for task completion."""
    
    if not settings.DEBUG:  # Only send in production
        try:
            subject = f"Great job! You completed: {task.topic.name}"
            message = f"""
            Congratulations! You've successfully completed studying {task.topic.name}.
            
            Your understanding level: {task.understanding_level}%
            Time spent: {task.actual_time_spent_seconds / 3600:.1f} hours
            
            Keep up the great work! Keep studying and preparing for your exam.
            
            Study Plan: {task.study_plan.name}
            Exam Date: {task.study_plan.exam_date}
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )
        except Exception as e:
            logger.warning(f"Failed to send task completion email: {e}")


def send_adjustment_notification(user, adjustment):
    """Send email notification for study plan adjustment."""
    
    if not settings.DEBUG:  # Only send in production
        try:
            subject = f"Your study plan has been adjusted"
            message = f"""
            Your study plan '{adjustment.study_plan.name}' has been adjusted based on your performance.
            
            Adjustment: {adjustment.get_adjustment_type_display()}
            Reason: {adjustment.reason}
            
            Please review your updated study plan to see the changes.
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )
        except Exception as e:
            logger.warning(f"Failed to send adjustment notification email: {e}")
