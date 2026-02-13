from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GamificationProfile, Badge, UserBadge
from .serializers import GamificationProfileSerializer, BadgeSerializer, UserBadgeSerializer
from .services.gamification_service import GamificationService

class GamificationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """
        Get current user's gamification profile.
        """
        # Ensure streak is updated on profile view
        GamificationService.update_streak(request.user)
        
        profile, _ = GamificationProfile.objects.get_or_create(user=request.user)
        serializer = GamificationProfileSerializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def badges(self, request):
        """
        List all badges, marking earned ones.
        """
        all_badges = Badge.objects.all()
        user_badges = UserBadge.objects.filter(user=request.user).values_list('badge_id', flat=True)
        
        data = []
        for badge in all_badges:
            badge_data = BadgeSerializer(badge).data
            badge_data['earned'] = badge.id in user_badges
            # If earned, add earned_at date? Ideally yes, but keeping it simple for listy view
            if badge.id in user_badges:
                 ub = UserBadge.objects.filter(user=request.user, badge=badge).first()
                 badge_data['earned_at'] = ub.earned_at
            
            data.append(badge_data)
            
        return Response(data)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """
        Get leaderboard (top users).
        """
        period = request.query_params.get('period', 'weekly')
        profiles = GamificationService.get_leaderboard(period)
        serializer = GamificationProfileSerializer(profiles, many=True)
        return Response(serializer.data)
