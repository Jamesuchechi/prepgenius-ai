"""
Rate limiting service for chat messages.
"""
from django.utils import timezone
from django.conf import settings
from ..models import ChatRateLimit


class RateLimiter:
    """Service for managing chat rate limits."""
    
    @staticmethod
    def check_rate_limit(user) -> tuple[bool, int]:
        """
        Check if user has exceeded rate limit.
        Returns (is_allowed, remaining_messages)
        """
        # Get or create rate limit record
        rate_limit, created = ChatRateLimit.objects.get_or_create(
            user=user,
            defaults={'message_count': 0, 'window_start': timezone.now()}
        )
        
        # Reset if needed
        rate_limit.reset_if_needed()
        
        # Get limit based on user subscription
        limit = RateLimiter._get_user_limit(user)
        
        # Check if rate limited
        if limit is None:  # Unlimited for premium users
            return True, -1  # -1 indicates unlimited
        
        is_allowed = rate_limit.message_count < limit
        remaining = max(0, limit - rate_limit.message_count)
        
        return is_allowed, remaining
    
    @staticmethod
    def increment_count(user):
        """Increment the message count for a user."""
        rate_limit, created = ChatRateLimit.objects.get_or_create(
            user=user,
            defaults={'message_count': 0, 'window_start': timezone.now()}
        )
        rate_limit.increment()
    
    @staticmethod
    def _get_user_limit(user) -> int | None:
        """
        Get the rate limit for a user based on their subscription.
        Returns None for unlimited.
        """
        # Check if user has a premium subscription
        # This assumes you have a subscription system in place
        if hasattr(user, 'subscription') and user.subscription and user.subscription.is_active:
            # Premium users get unlimited messages
            return None
        
        # Free users get limited messages
        chat_limits = getattr(settings, 'CHAT_RATE_LIMITS', {})
        return chat_limits.get('free', {}).get('messages_per_hour', 50)
    
    @staticmethod
    def get_reset_time(user) -> timezone.datetime:
        """Get the time when the rate limit will reset."""
        try:
            rate_limit = ChatRateLimit.objects.get(user=user)
            return rate_limit.window_start + timezone.timedelta(hours=1)
        except ChatRateLimit.DoesNotExist:
            return timezone.now() + timezone.timedelta(hours=1)
