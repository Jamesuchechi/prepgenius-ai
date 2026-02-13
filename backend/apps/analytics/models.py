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

class StudySession(models.Model):
    """
    Tracks individual study sessions.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_sessions')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=0)
    questions_answered = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.start_time.date()}"

    def save(self, *args, **kwargs):
        if (self.end_time and self.start_time) and (self.end_time > self.start_time):
            delta = self.end_time - self.start_time
            self.duration_minutes = int(delta.total_seconds() / 60)
        super().save(*args, **kwargs)

class SpacedRepetitionItem(models.Model):
    """
    Tracks review schedule for topics/questions.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spaced_repetition_items')
    topic = models.CharField(max_length=255)
    question_identifier = models.CharField(max_length=255, blank=True, null=True)
    
    ease_factor = models.FloatField(default=2.5)
    interval = models.IntegerField(default=0)
    repetitions = models.IntegerField(default=0)
    
    next_review_date = models.DateField()
    last_reviewed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'topic', 'question_identifier']

    def __str__(self):
        return f"{self.user.username} - {self.topic} - Due: {self.next_review_date}"
