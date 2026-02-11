from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.content.models import Topic, Subject

class ProgressTracker(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_tracker')
    total_questions_attempted = models.IntegerField(default=0)
    total_correct_answers = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateTimeField(null=True, blank=True)
    total_study_time_seconds = models.IntegerField(default=0)
    
    def update_streak(self):
        today = timezone.now().date()
        if self.last_activity_date:
            last_date = self.last_activity_date.date()
            if today == last_date:
                pass # Already updated for today
            elif today == last_date + timezone.timedelta(days=1):
                self.current_streak += 1
            else:
                self.current_streak = 1
        else:
            self.current_streak = 1
            
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
            
        self.last_activity_date = timezone.now()
        self.save()

    def __str__(self):
        return f"Progress for {self.user}"

class TopicMastery(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='topic_mastery')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    total_attempts = models.IntegerField(default=0)
    correct_attempts = models.IntegerField(default=0)
    mastery_percentage = models.FloatField(default=0.0)
    time_spent_seconds = models.IntegerField(default=0)  
    last_practiced = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'topic')
        verbose_name_plural = "Topic Masteries"

    def update_mastery(self, is_correct, time_taken=0):
        self.total_attempts += 1
        if is_correct:
            self.correct_attempts += 1
        self.time_spent_seconds += time_taken
        self.mastery_percentage = (self.correct_attempts / self.total_attempts) * 100
        self.save()

    def __str__(self):
        return f"{self.user} - {self.topic} ({self.mastery_percentage:.1f}%)"

class StudySession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_sessions')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_seconds = models.IntegerField()
    questions_attempted = models.IntegerField(default=0)
    correct_questions = models.IntegerField(default=0)  
    
    def __str__(self):
        return f"{self.user} - {self.duration_seconds}s"
