from django.utils import timezone
from django.db.models import Sum
from apps.gamification.models import GamificationProfile, Badge, UserBadge
from datetime import timedelta

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
        
        # Level up logic: Level N requires N * 100 XP
        # This is a simple linear progression for MVP
        xp_needed = profile.current_level * 100
        if profile.current_xp >= xp_needed:
            profile.current_level += 1
            profile.current_xp -= xp_needed
            # TODO: Create a notification for level up
            
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
            UserBadge.objects.create(user=user, badge=badge)
            new_badges.append(badge)
            # Award points for the badge
            GamificationService.award_points(user, badge.points_award, f"Badge Earned: {badge.name}")
            
        return new_badges

    @staticmethod
    def update_streak(user):
        """
        Updates the user's daily streak. Should be called on daily login/activity.
        """
        profile, created = GamificationProfile.objects.get_or_create(user=user)
        today = timezone.now().date()
        
        if profile.last_activity_date == today:
            return profile # Already updated today
            
        if profile.last_activity_date == today - timedelta(days=1):
            profile.current_streak += 1
        else:
            profile.current_streak = 1
            
        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak
            
        profile.last_activity_date = today
        profile.save()
        
        # Check streak badges
        GamificationService.check_badges(user, 'streak', profile.current_streak)
        
        return profile
    
    @staticmethod
    def get_leaderboard(period='weekly', limit=10):
        """
        Returns top users based on total points.
        """
        # For MVP, we'll just query GamificationProfile directly.
        # In a real app, we might use the Snapshot model or a Redis leaderboard.
        return GamificationProfile.objects.select_related('user').order_by('-total_points_earned')[:limit]
