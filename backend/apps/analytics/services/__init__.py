from django.utils import timezone
from apps.analytics.models import ProgressTracker, TopicMastery
from datetime import timedelta


class AnalyticsService:
    @staticmethod
    def update_streak(user):
        """
        Updates variable progress metrics: streak, last_activity_date.
        Should be called whenever a user performs a significant study action.
        """
        today = timezone.now().date()
        progress, created = ProgressTracker.objects.get_or_create(user=user)

        if not progress.last_activity_date:
            # First activity ever
            progress.current_streak = 1
            progress.longest_streak = 1
        elif progress.last_activity_date == today:
            # Already active today, no streak change
            pass
        elif progress.last_activity_date == today - timedelta(days=1):
            # Consecutive day
            progress.current_streak += 1
            if progress.current_streak > progress.longest_streak:
                progress.longest_streak = progress.current_streak
        else:
            # Streak broken
            progress.current_streak = 1
        
        progress.last_activity_date = today
        progress.save()
        return progress

    @staticmethod
    def log_study_time(user, minutes):
        progress, created = ProgressTracker.objects.get_or_create(user=user)
        progress.total_study_minutes += minutes
        progress.save()

    @staticmethod
    def update_quiz_stats(user, topic, score_percentage):
        """
        Updates topic mastery based on quiz results.
        Simple moving average or weighted update could be used. 
        For now: Average score.
        """
        mastery, created = TopicMastery.objects.get_or_create(
            user=user, 
            topic=topic,
            defaults={'mastery_score': score_percentage, 'quizzes_taken': 1}
        )

        if not created:
            # Update weighted average? Or just simple moving average?
            # New Average = ((Old * Count) + New) / (Count + 1)
            total_score = (mastery.mastery_score * mastery.quizzes_taken) + score_percentage
            mastery.quizzes_taken += 1
            mastery.mastery_score = total_score / mastery.quizzes_taken
            mastery.save()
        
        # Also update streak
        AnalyticsService.update_streak(user)
        
        # Update progress quiz count
        progress, _ = ProgressTracker.objects.get_or_create(user=user)
        progress.total_quizzes_taken += 1
        progress.save()


__all__ = ['AnalyticsService']
