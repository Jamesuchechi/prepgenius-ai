from django.conf import settings
from django.db import models

class ProgressTracker(models.Model):
    """
    Tracks overall user study progress and streaks.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    total_study_minutes = models.IntegerField(default=0)
    total_quizzes_taken = models.IntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Streak: {self.current_streak}"

class TopicMastery(models.Model):
    """
    Tracks user proficiency in specific topics based on quiz results.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='topic_mastery')
    topic = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, blank=True, null=True)
    mastery_score = models.FloatField(default=0.0, help_text="Score from 0 to 100")
    quizzes_taken = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'topic']
        verbose_name_plural = "Topic Masteries"

    def __str__(self):
        return f"{self.user.username} - {self.topic}: {self.mastery_score}%"
