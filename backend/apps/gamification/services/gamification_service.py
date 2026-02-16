from django.utils import timezone
from apps.gamification.models import GamificationProfile, Badge, UserBadge
from apps.analytics.models import ProgressTracker
from datetime import timedelta

from apps.notifications.services import NotificationService

class GamificationService:
    @staticmethod
    def award_points(user, points, reason="Action"):
        """
        Awards points to a user and handles level ups.
        """
        profile, created = GamificationProfile.objects.get_or_create(user=user)
        profile.current_points += points
        profile.total_points_earned += points
        profile.current_xp += points
        
        # Level up logic: Progressive XP needed
        # Level N requires (N * 200) XP
        xp_needed = profile.current_level * 200
        while profile.current_xp >= xp_needed:
            profile.current_level += 1
            profile.current_xp -= xp_needed
            xp_needed = profile.current_level * 200
            
        profile.save()
        return profile

    @staticmethod
    def check_badges(user, action_type, count=0):
        """
        Checks if a user has unlocked any badges based on the action.
        """
        # Find badges for this category that the user hasn't earned yet
        potential_badges = Badge.objects.filter(
            category=action_type, 
            threshold__lte=count
        ).exclude(userbadge__user=user)
        
        new_badges = []
        for badge in potential_badges:
            UserBadge.objects.get_or_create(user=user, badge=badge)
            new_badges.append(badge)
            # Award points for the badge
            GamificationService.award_points(user, badge.points_award, f"Badge Earned: {badge.name}")
            # Send Notification
            NotificationService.create_notification(
                user=user,
                title="🏆 Achievement Unlocked!",
                message=f"Congratulations! You've earned the '{badge.name}' badge.",
                notification_type='achievement'
            )
            
        return new_badges

    @staticmethod
    def update_streak(user):
        """
        Updates the user's daily streak. Synced across Gamification and Analytics.
        """
        profile, _ = GamificationProfile.objects.get_or_create(user=user)
        today = timezone.now().date()
        
        if profile.last_activity_date == today:
            return profile
            
        if profile.last_activity_date == today - timedelta(days=1):
            profile.current_streak += 1
        else:
            profile.current_streak = 1
            
        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak
            
        profile.last_activity_date = today
        profile.save()

        # Sync with Analytics ProgressTracker
        try:
            progress, _ = ProgressTracker.objects.get_or_create(user=user)
            progress.current_streak = profile.current_streak
            if profile.current_streak > progress.longest_streak:
                progress.longest_streak = profile.current_streak
            progress.last_activity_date = today
            progress.save()
        except Exception as e:
            print(f"Error syncing streak to analytics: {e}")
        
        # Check streak badges
        GamificationService.check_badges(user, 'streak', profile.current_streak)
        
        return profile
    
    @staticmethod
    def get_leaderboard(period='weekly', limit=10):
        """
        Returns top users based on total points.
        """
        return GamificationProfile.objects.select_related('user').order_by('-total_points_earned')[:limit]
