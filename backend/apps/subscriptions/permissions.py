"""
Feature gating system for subscription-based access control.

This module provides decorators and utilities to restrict access to features
based on user subscription tier.
"""

import logging
from functools import wraps
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework import status

from .services.subscription_service import SubscriptionService

logger = logging.getLogger(__name__)


def require_subscription_feature(feature_name: str):
    """
    Decorator for API views that require a specific feature.
    
    Usage:
        @require_subscription_feature('mock_exams')
        def my_view(request):
            ...
    
    Args:
        feature_name: Name of the feature (e.g., 'mock_exams', 'ai_tutor')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            # Check if user is authenticated
            if not request.user or not request.user.is_authenticated:
                raise PermissionDenied('Authentication required')

            # Check if user has access to feature
            has_access, reason = SubscriptionService.can_use_feature(
                request.user,
                feature_name
            )

            if not has_access:
                raise PermissionDenied(f'Feature not available: {reason}')

            return view_func(self, request, *args, **kwargs)
        return wrapper
    return decorator


def require_paid_subscription(view_func):
    """
    Decorator to require a paid subscription (not free tier).
    
    Usage:
        @require_paid_subscription
        def my_view(request):
            ...
    """
    @wraps(view_func)
    def wrapper(self, request, *args, **kwargs):
        if not request.user or not request.user.is_authenticated:
            raise PermissionDenied('Authentication required')

        subscription = SubscriptionService.get_user_subscription(request.user)
        
        if subscription.plan.name == 'free':
            raise PermissionDenied('This feature requires a paid subscription')

        return view_func(self, request, *args, **kwargs)
    return wrapper


def check_feature_access(user, feature_name: str) -> tuple[bool, str]:
    """
    Check if a user can access a feature.
    
    Args:
        user: User object
        feature_name: Name of the feature
    
    Returns:
        Tuple of (can_access: bool, message: str)
    """
    return SubscriptionService.can_use_feature(user, feature_name)


def get_user_subscription_info(user) -> dict:
    """
    Get comprehensive subscription information for a user.
    
    Args:
        user: User object
    
    Returns:
        Dictionary with subscription details
    """
    subscription = SubscriptionService.get_user_subscription(user)
    
    return {
        'plan': subscription.plan.name,
        'plan_name': subscription.plan.display_name,
        'status': subscription.status,
        'is_active': subscription.is_active(),
        'days_remaining': subscription.days_remaining(),
        'auto_renew': subscription.auto_renew,
        'expired_at': subscription.expires_at,
        'features': {
            'mock_exams': subscription.plan.has_mock_exams,
            'ai_tutor': subscription.plan.has_ai_tutor,
            'audio_mode': subscription.plan.has_audio_mode,
            'document_mode': subscription.plan.has_document_mode,
            'offline_mode': subscription.plan.has_offline_mode,
            'premium_content': subscription.plan.has_premium_content,
            'priority_support': subscription.plan.has_priority_support,
        },
        'limits': {
            'questions_per_day': subscription.plan.questions_per_day,
            'study_sessions_per_month': subscription.plan.study_sessions_per_month,
            'max_topics': subscription.plan.max_topics,
        }
    }


class FeatureGateMixin:
    """
    Mixin for DRF viewsets to add feature gating.
    
    Usage:
        class MyViewSet(FeatureGateMixin, viewsets.ModelViewSet):
            required_feature = 'mock_exams'
            ...
    """
    required_feature = None

    def check_feature_access(self, request):
        """Check if user has access to the required feature."""
        if not self.required_feature:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        has_access, _ = SubscriptionService.can_use_feature(
            request.user,
            self.required_feature
        )
        return has_access

    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to check feature access."""
        if hasattr(self, 'required_feature') and self.required_feature:
            if not self.check_feature_access(request):
                raise PermissionDenied(
                    f'Access to {self.required_feature} requires a valid subscription'
                )

        return super().dispatch(request, *args, **kwargs)


def enforce_daily_limit(feature_attr: str):
    """
    Decorator to enforce daily usage limits.
    
    Usage:
        @enforce_daily_limit('questions_per_day')
        def generate_question(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            if not request.user or not request.user.is_authenticated:
                raise PermissionDenied('Authentication required')

            try:
                feature_usage = request.user.subscription_feature_usage
            except:
                from .models import SubscriptionFeatureUsage
                feature_usage = SubscriptionFeatureUsage.objects.create(
                    user=request.user
                )

            # Reset daily limits if needed
            feature_usage.reset_daily_limits()

            # Check if user can access question
            if not feature_usage.can_access_question():
                limit = request.user.user_subscription.plan.questions_per_day
                raise ValidationError(
                    f'Daily limit of {limit} questions reached. '
                    f'Please come back tomorrow or upgrade your subscription.'
                )

            # Process the request
            response = view_func(self, request, *args, **kwargs)

            # Increment usage on success
            if response.status_code < 300:
                feature_usage.increment_question_usage()

            return response
        return wrapper
    return decorator


def get_subscription_status(user) -> dict:
    """
    Get subscription status with all relevant information.
    
    Args:
        user: User object
    
    Returns:
        Dictionary with full subscription status
    """
    subscription = SubscriptionService.get_user_subscription(user)

    try:
        feature_usage = user.subscription_feature_usage
    except:
        from .models import SubscriptionFeatureUsage
        feature_usage = SubscriptionFeatureUsage.objects.create(user=user)

    return {
        'subscription': {
            'plan': subscription.plan.name,
            'plan_name': subscription.plan.display_name,
            'status': subscription.status,
            'is_active': subscription.is_active(),
            'started_at': subscription.started_at,
            'expires_at': subscription.expires_at,
            'days_remaining': subscription.days_remaining(),
            'auto_renew': subscription.auto_renew,
        },
        'features': {
            'mock_exams': subscription.plan.has_mock_exams,
            'ai_tutor': subscription.plan.has_ai_tutor,
            'audio_mode': subscription.plan.has_audio_mode,
            'document_mode': subscription.plan.has_document_mode,
            'offline_mode': subscription.plan.has_offline_mode,
            'premium_content': subscription.plan.has_premium_content,
            'priority_support': subscription.plan.has_priority_support,
        },
        'limits': {
            'questions_per_day': subscription.plan.questions_per_day,
            'questions_used_today': feature_usage.questions_used_today,
            'study_sessions_per_month': subscription.plan.study_sessions_per_month,
            'study_sessions_this_month': feature_usage.study_sessions_this_month,
            'max_topics': subscription.plan.max_topics,
        }
    }
