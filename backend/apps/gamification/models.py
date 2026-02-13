from django.conf import settings
from django.db import models

class GamificationProfile(models.Model):
    """
    Extends user profile with gamification stats.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='gamification')
    current_points = models.IntegerField(default=0)
    total_points_earned = models.IntegerField(default=0) # Lifetime points
    current_level = models.IntegerField(default=1)
    current_xp = models.IntegerField(default=0)
    
    # Streak tracking
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Lvl {self.current_level}"

class Badge(models.Model):
    """
    Defines an achievement/badge that can be earned.
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, help_text="Name of the icon to display (e.g., from Lucide or custom)")
    points_award = models.IntegerField(default=10)
    
    # Criteria (could be JSON or fields, keeping it simple for now)
    category = models.CharField(max_length=50, choices=[
        ('streak', 'Streak'),
        ('quiz', 'Quiz Master'),
        ('time', 'Dedication'),
        ('special', 'Special Event')
    ], default='special')
    
    threshold = models.IntegerField(default=1, help_text="Value required to unlock (e.g., 7 days, 100 quizzes)")

    def __str__(self):
        return self.name

class UserBadge(models.Model):
    """
    Connects a user to a badge they have earned.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achieved_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'badge']

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"

class LeaderboardSnapshot(models.Model):
    """
    Daily snapshot of top users for historical records/trends.
    """
    date = models.DateField(auto_now_add=True)
    period = models.CharField(max_length=20, choices=[('daily', 'Daily'), ('weekly', 'Weekly')], default='daily')
    data = models.JSONField(help_text="List of top users and their scores")

    class Meta:
        unique_together = ['date', 'period']
