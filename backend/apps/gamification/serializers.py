from rest_framework import serializers
from .models import GamificationProfile, Badge, UserBadge, LeaderboardSnapshot
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'profile_picture']

class GamificationProfileSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = GamificationProfile
        fields = ['user', 'current_points', 'total_points_earned', 'current_level', 'current_xp', 'current_streak', 'longest_streak']

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'slug', 'description', 'icon_name', 'points_award', 'category']

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['badge', 'earned_at']
