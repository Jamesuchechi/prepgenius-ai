"""
Celery tasks for the study_plans app.
Handles background tasks like sending reminders.
"""

from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import logging

from .models import StudyReminder, StudyTask, StudyPlan

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_study_reminders(self):
    """
    Send all pending study reminders.
    Should be run periodically (e.g., every 15 minutes).
    """
    
    try:
        # Get all reminders that should be sent
        pending_reminders = StudyReminder.objects.filter(
            is_active=True,
            scheduled_datetime__lte=timezone.now()
        ).exclude(
            last_sent__gte=timezone.now() - timezone.timedelta(hours=1)
        )[:50]  # Limit to prevent overload
        
        sent_count = 0
        
        for reminder in pending_reminders:
            try:
                send_reminder_notification(reminder)
                reminder.mark_sent()
                sent_count += 1
                
                # Mark as inactive if one-time reminder
                if reminder.frequency == 'once':
                    reminder.is_active = False
                    reminder.save()
                    
            except Exception as e:
                logger.error(f"Failed to send reminder {reminder.id}: {e}")
                continue
        
        logger.info(f"Sent {sent_count} study reminders")
        return {'sent': sent_count}
        
    except Exception as e:
        logger.error(f"Error in send_study_reminders: {e}")
        # Retry after 60 seconds
        raise self.retry(countdown=60, exc=e)


@shared_task
def update_study_plan_progress():
    """
    Periodically update all active study plans' progress.
    Should run daily.
    """
    
    active_plans = StudyPlan.objects.filter(status='active')
    updated_count = 0
    
    for plan in active_plans:
        try:
            plan.update_progress()
            updated_count += 1
        except Exception as e:
            logger.error(f"Error updating plan {plan.id}: {e}")
    
    logger.info(f"Updated progress for {updated_count} study plans")
    return {'updated': updated_count}


@shared_task
def detect_overdue_tasks():
    """
    Detect and mark overdue study tasks.
    Should run daily.
    """
    
    now = timezone.now().date()
    
    # Get tasks that are overdue
    overdue_tasks = StudyTask.objects.filter(
        status__in=['pending', 'in_progress'],
        scheduled_end_date__lt=now
    )
    
    # For now, we just track them. In future, could create reminders or notifications
    count = overdue_tasks.count()
    
    logger.info(f"Found {count} overdue study tasks")
    return {'overdue_count': count}


@shared_task
def generate_daily_study_reminders():
    """
    Generate daily study goal reminders for all active plans.
    Should run once daily at a specific time.
    """
    
    from .models import StudyReminder
    from datetime import datetime
    import random
    
    active_plans = StudyPlan.objects.filter(status='active')
    reminder_time = timezone.make_aware(datetime.combine(
        timezone.now().date() + timezone.timedelta(days=1),
        timezone.datetime.time(8, 30)  # 8:30 AM
    ))
    
    created_count = 0
    
    for plan in active_plans:
        try:
            # Check if daily reminder already exists for tomorrow
            exists = StudyReminder.objects.filter(
                study_plan=plan,
                reminder_type='daily_goal',
                scheduled_datetime__date=reminder_time.date(),
                is_active=True
            ).exists()
            
            if not exists:
                # Get pending tasks for tomorrow
                tomorrow = reminder_time.date()
                tasks_tomorrow = plan.tasks.filter(
                    scheduled_start_date__lte=tomorrow,
                    scheduled_end_date__gte=tomorrow,
                    status__in=['pending', 'in_progress']
                )
                
                if tasks_tomorrow.exists():
                    task_list = ', '.join([t.topic.name for t in tasks_tomorrow])
                    
                    StudyReminder.objects.create(
                        study_plan=plan,
                        user=plan.user,
                        reminder_type='daily_goal',
                        frequency='once',
                        scheduled_datetime=reminder_time,
                        title='Daily Study Goals',
                        message=f"Today's study goals: {task_list}",
                        is_active=True
                    )
                    
                    created_count += 1
                    
        except Exception as e:
            logger.error(f"Error creating daily reminder for plan {plan.id}: {e}")
    
    logger.info(f"Created {created_count} daily study reminders")
    return {'created': created_count}


@shared_task
def send_exam_countdown_reminder():
    """
    Send countdown reminders as exams approach.
    Should run daily.
    """
    
    from datetime import timedelta
    
    now = timezone.now()
    today = now.date()
    
    # 7 days before exam
    week_before = today + timedelta(days=7)
    plans_week = StudyPlan.objects.filter(
        exam_date=week_before,
        status__in=['active', 'paused']
    )
    
    for plan in plans_week:
        try:
            # Check if reminder already sent today
            exists = StudyReminder.objects.filter(
                study_plan=plan,
                reminder_type='task_deadline',
                last_sent__date=today
            ).exists()
            
            if not exists:
                StudyReminder.objects.create(
                    study_plan=plan,
                    user=plan.user,
                    reminder_type='task_deadline',
                    frequency='once',
                    scheduled_datetime=now,
                    title='One week until your exam!',
                    message=f"You have exactly one week until your {plan.exam_type.name} exam on {plan.exam_date}. "
                            "Focus on revision of weak areas.",
                    is_active=True
                )
        except Exception as e:
            logger.error(f"Error sending countdown reminder for plan {plan.id}: {e}")
    
    logger.info(f"Sent countdown reminders to {plans_week.count()} users")


def send_reminder_notification(reminder: StudyReminder):
    """
    Send a reminder notification to the user via email (and potentially SMS/push).
    
    Args:
        reminder: The StudyReminder instance to send
    """
    
    user = reminder.user
    
    # Build email content
    subject = reminder.title
    message = f"""
    {reminder.message}
    
    {f"Task: {reminder.study_task.topic.name}" if reminder.study_task else ""}
    {f"Study Plan: {reminder.study_plan.name}" if reminder.study_plan else ""}
    
    Keep up your study routine and stay focused on your goals!
    """
    
    try:
        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Reminder notification sent to {user.email}")
        
        # TODO: Send SMS notification if user has phone number
        # send_sms_reminder(user, reminder)
        
        # TODO: Send push notification
        # send_push_notification(user, reminder)
        
    except Exception as e:
        logger.error(f"Failed to send reminder notification: {e}")
        raise
