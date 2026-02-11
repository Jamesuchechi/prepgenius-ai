from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.questions.models import QuestionAttempt
from .models import ProgressTracker, TopicMastery

print("Loading analytics signals...")

@receiver(post_save, sender=QuestionAttempt)
def update_analytics(sender, instance, created, **kwargs):
    if created:
        print(f"Updating analytics for user {instance.user}")
        user = instance.user
        question = instance.question
        is_correct = instance.is_correct
        
        # Update ProgressTracker
        tracker, _ = ProgressTracker.objects.get_or_create(user=user)
        tracker.total_questions_attempted += 1
        if is_correct:
            tracker.total_correct_answers += 1
        
        tracker.update_streak() # This saves the tracker
        tracker.save() # Save again just in case update_streak logic changes
        
        # Update TopicMastery
        if question.topic:
            mastery, _ = TopicMastery.objects.get_or_create(user=user, topic=question.topic)
            mastery.update_mastery(is_correct, time_taken=instance.time_taken_seconds)
