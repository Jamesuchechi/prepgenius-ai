
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.questions.models import QuestionAttempt
from apps.study_plans.services.progress_service import StudyPlanProgressService
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=QuestionAttempt)
def update_study_plan_progress(sender, instance, created, **kwargs):
    """
    Signal handler to update study plan progress when a question is attempted.
    """
    if created:
        try:
            StudyPlanProgressService.handle_question_attempt(instance)
        except Exception as e:
            logger.error(f"Error updating study plan progress: {e}")


from apps.quiz.models import QuizAttempt
from apps.study_plans.models import StudyPlanAssessment
from django.utils import timezone

@receiver(post_save, sender=QuizAttempt)
def handle_milestone_quiz_completion(sender, instance, **kwargs):
    """
    When a quiz attempt is completed, check if it was for a study plan assessment.
    If it's an exit quiz and it's passed, mark the plan as completed.
    """
    if instance.status == 'COMPLETED':
        # Find any study plan assessments linked to the quiz being attempted
        assessments = StudyPlanAssessment.objects.filter(quiz=instance.quiz)
        
        for assessment in assessments:
            # Link the latest attempt
            assessment.last_attempt = instance
            assessment.save()
            
            if assessment.assessment_type == 'exit_quiz' and assessment.is_passed():
                plan = assessment.study_plan
                # Only update if not already completed
                if plan.status != 'completed':
                    plan.status = 'completed'
                    plan.actual_completion_date = timezone.now().date()
                    plan.save()
                    logger.info(f"Study plan {plan.id} marked as COMPLETED via Exit Quiz pass.")
