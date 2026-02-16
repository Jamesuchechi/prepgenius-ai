from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from apps.quiz.models import QuizAttempt, AnswerAttempt
from apps.exams.models import ExamResult
from apps.ai_tutor.models import ChatMessage
from apps.study_plans.models import StudyTask
from .models import ProgressTracker, TopicMastery, StudySession
from .services import AnalyticsService
from apps.gamification.services.gamification_service import GamificationService
from datetime import timedelta

print("Loading analytics signals...")

@receiver(post_save, sender=QuizAttempt)
def update_analytics_on_quiz_completion(sender, instance, created, **kwargs):
    """
    Updates progress tracker and topic mastery when a quiz is completed.
    """
    if not instance.status == 'COMPLETED' or not instance.completed_at:
        return
    
    user = instance.user
    GamificationService.update_streak(user)
    
    # Award points: 5 per correct answer + 50 bonus for 100%
    points = instance.correct_answers * 5
    if instance.total_questions > 0 and instance.correct_answers == instance.total_questions:
        points += 50
    
    if points > 0:
        GamificationService.award_points(user, points, f"Quiz Performance: {instance.quiz.topic}")
    
    # Check for quiz-related badges
    progress, _ = ProgressTracker.objects.get_or_create(user=user)
    GamificationService.check_badges(user, 'quiz', progress.total_quizzes_taken + 1)

    progress.total_quizzes_taken += 1
    
    if instance.completed_at and instance.started_at:
        delta = instance.completed_at - instance.started_at
        progress.total_study_minutes += int(delta.total_seconds() / 60)
    
    progress.save()
    
    # Create StudySession
    if instance.completed_at:
        StudySession.objects.get_or_create(
            user=user,
            start_time=instance.started_at or instance.completed_at - timedelta(minutes=15),
            end_time=instance.completed_at,
            defaults={
                'subject': instance.quiz.topic,
                'questions_answered': instance.total_questions,
                'correct_count': instance.correct_answers
            }
        )
    
    if instance.quiz.topic:
        if instance.total_questions > 0:
            score_percentage = (instance.correct_answers / instance.total_questions) * 100
        else:
            score_percentage = 0
        AnalyticsService.update_quiz_stats(user, instance.quiz.topic, score_percentage)

@receiver(post_save, sender=ExamResult)
def update_analytics_on_exam_completion(sender, instance, created, **kwargs):
    """
    Updates progress tracker and topic mastery when a mock exam is completed.
    """
    if not created:
        return
    
    user = instance.attempt.user
    GamificationService.update_streak(user)
    
    # Award points: 10 per correct answer + 200 bonus for completion
    points = instance.correct_answers * 10 + 200
    GamificationService.award_points(user, points, f"Mock Exam: {instance.attempt.mock_exam.title}")

    progress, _ = ProgressTracker.objects.get_or_create(user=user)
    progress.total_mock_exams_taken += 1
    
    attempt = instance.attempt
    if attempt.completed_at and attempt.started_at:
        delta = attempt.completed_at - attempt.started_at
        progress.total_study_minutes += int(delta.total_seconds() / 60)
    
    progress.save()
    
    # Create StudySession
    if attempt.completed_at:
        StudySession.objects.get_or_create(
            user=user,
            start_time=attempt.started_at or attempt.completed_at - timedelta(minutes=60),
            end_time=attempt.completed_at,
            defaults={
                'subject': attempt.mock_exam.subject.name,
                'questions_answered': attempt.attempted_questions,
                'correct_count': instance.correct_answers
            }
        )
    
    # Update mastery for the exam subject
    subject_name = attempt.mock_exam.subject.name
    AnalyticsService.update_quiz_stats(user, subject_name, instance.percentage)

@receiver(post_save, sender=ChatMessage)
def update_analytics_on_tutor_message(sender, instance, created, **kwargs):
    """
    Increments tutor interaction count and updates streak on chat activity.
    """
    if not created or instance.role != 'user':
        return
    
    user = instance.session.user
    GamificationService.update_streak(user)
    
    # Award small XP for engagement
    GamificationService.award_points(user, 2, "AI Tutor Interaction")

    progress, _ = ProgressTracker.objects.get_or_create(user=user)
    progress.tutor_interactions_count += 1
    progress.save()

@receiver(post_save, sender=StudyTask)
def update_analytics_on_task_completion(sender, instance, created, **kwargs):
    """
    Updates study minutes when a task is completed.
    """
    if instance.status == 'completed' and instance.actual_completion_date:
        user = instance.study_plan.user
        GamificationService.update_streak(user)
        
        minutes = int(instance.actual_time_spent_seconds / 60)
        if minutes > 0:
            AnalyticsService.log_study_time(user, minutes)
            # Award 1 XP per minute of study
            GamificationService.award_points(user, minutes, f"Task Completed: {instance.title}")
            # Check for dedication badges
            GamificationService.check_badges(user, 'time', minutes) # This needs cumulative logic in service or threshold check

@receiver(post_save, sender=AnswerAttempt)
def update_analytics_on_answer(sender, instance, created, **kwargs):
    """
    Updates question counts in real-time.
    """
    if not created:
        return
    
    user = instance.quiz_attempt.user
    progress, _ = ProgressTracker.objects.get_or_create(user=user)
    
    progress.total_questions_attempted += 1
    if instance.is_correct:
        progress.total_correct_answers += 1
    
    progress.save()
