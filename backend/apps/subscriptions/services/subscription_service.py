import logging
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from typing import Optional

from ..models import UserSubscription, SubscriptionPlan, PaymentTransaction

logger = logging.getLogger(__name__)


class SubscriptionService:
    """
    Service for managing user subscriptions.
    
    Handles:
    - Subscription creation/activation
    - Subscription renewal
    - Subscription upgrades/downgrades
    - Subscription expiration
    """

    @staticmethod
    def activate_subscription(
        user,
        plan: SubscriptionPlan,
        payment_transaction: Optional[PaymentTransaction] = None,
        auto_renew: bool = True
    ) -> UserSubscription:
        """
        Activate a subscription for a user.
        
        Args:
            user: User object
            plan: SubscriptionPlan object
            payment_transaction: Related payment transaction
            auto_renew: Whether to auto-renew subscription
        
        Returns:
            UserSubscription object
        """
        # Check if user already has a subscription
        existing_subscription = UserSubscription.objects.filter(user=user).first()

        if existing_subscription:
            existing_subscription.plan = plan
            existing_subscription.status = 'active'
            existing_subscription.auto_renew = auto_renew
            existing_subscription.started_at = timezone.now()
            existing_subscription.last_payment_date = timezone.now()
        else:
            existing_subscription = UserSubscription(
                user=user,
                plan=plan,
                status='active',
                auto_renew=auto_renew,
                started_at=timezone.now(),
                last_payment_date=timezone.now()
            )

        # Set expiration date based on plan duration
        if plan.duration_days > 0:
            existing_subscription.expires_at = timezone.now() + timedelta(days=plan.duration_days)
            existing_subscription.next_billing_date = existing_subscription.expires_at
        else:
            # Free plan doesn't expire
            existing_subscription.expires_at = None
            existing_subscription.next_billing_date = None

        # Link payment transaction if provided
        if payment_transaction:
            existing_subscription.paystack_authorization_code = payment_transaction.paystack_authorization_code
            
        existing_subscription.save()
        logger.info(f"Subscription activated for user {user.id} - Plan: {plan.name}")

        return existing_subscription

    @staticmethod
    def renew_subscription(
        subscription: UserSubscription,
        hours: int = 24
    ) -> UserSubscription:
        """
        Renew an expiring subscription.
        
        Args:
            subscription: UserSubscription object
            hours: Number of hours before expiration to allow renewal
        
        Returns:
            UserSubscription object
        """
        # Check if subscription is close to expiration
        if subscription.expires_at:
            time_until_expiration = subscription.expires_at - timezone.now()
            if time_until_expiration.total_seconds() > (hours * 3600):
                raise Exception('Subscription is not close to expiration yet')

        # Renew subscription
        subscription.renew()
        logger.info(f"Subscription renewed for user {subscription.user.id}")

        return subscription

    @staticmethod
    def upgrade_subscription(
        subscription: UserSubscription,
        new_plan: SubscriptionPlan
    ) -> UserSubscription:
        """
        Upgrade a subscription to a higher tier.
        
        Args:
            subscription: UserSubscription object
            new_plan: New SubscriptionPlan object
        
        Returns:
            UserSubscription object
        """
        # Calculate price difference (prorated)
        current_plan = subscription.plan
        
        if new_plan.price <= current_plan.price:
            raise Exception('Cannot upgrade to a lower-priced plan. Use downgrade instead.')

        # Update subscription
        subscription.plan = new_plan
        subscription.status = 'active'
        subscription.updated_at = timezone.now()
        
        # Extend expiration date if user paid more
        if subscription.expires_at:
            subscription.expires_at = subscription.expires_at
        elif new_plan.duration_days > 0:
            subscription.expires_at = timezone.now() + timedelta(days=new_plan.duration_days)
            subscription.next_billing_date = subscription.expires_at

        subscription.save()
        logger.info(f"Subscription upgraded for user {subscription.user.id} - Old: {current_plan.name}, New: {new_plan.name}")

        return subscription

    @staticmethod
    def downgrade_subscription(
        subscription: UserSubscription,
        new_plan: SubscriptionPlan
    ) -> UserSubscription:
        """
        Downgrade a subscription to a lower tier.
        
        Args:
            subscription: UserSubscription object
            new_plan: New SubscriptionPlan object
        
        Returns:
            UserSubscription object
        """
        current_plan = subscription.plan
        
        if new_plan.price > current_plan.price:
            raise Exception('Cannot downgrade to a higher-priced plan. Use upgrade instead.')

        # Update subscription
        subscription.plan = new_plan
        subscription.updated_at = timezone.now()

        # Keep same expiration date but mark for review at renewal
        if subscription.expires_at:
            # Downgrade takes effect at next billing cycle
            pass
        elif new_plan.duration_days > 0:
            subscription.expires_at = timezone.now() + timedelta(days=new_plan.duration_days)

        subscription.save()
        logger.info(f"Subscription downgraded for user {subscription.user.id} - Old: {current_plan.name}, New: {new_plan.name}")

        return subscription

    @staticmethod
    def check_expired_subscriptions():
        """
        Check and expire subscriptions that have passed expiration date.
        Should be run periodically (e.g., as a Celery task).
        """
        now = timezone.now()
        expired_subscriptions = UserSubscription.objects.filter(
            status='active',
            expires_at__lt=now
        )

        count = 0
        for subscription in expired_subscriptions:
            subscription.status = 'expired'
            subscription.save()
            count += 1
            logger.info(f"Subscription expired for user {subscription.user.id}")

        return count

    @staticmethod
    def get_user_subscription(user) -> Optional[UserSubscription]:
        """
        Get user's current subscription or create free tier if none exists.
        
        Args:
            user: User object
        
        Returns:
            UserSubscription object
        """
        subscription = UserSubscription.objects.filter(user=user).first()
        
        if not subscription:
            # Create free tier subscription
            free_plan = SubscriptionPlan.objects.get(name='free')
            subscription = UserSubscription.objects.create(
                user=user,
                plan=free_plan,
                status='active'
            )
            logger.info(f"Free tier subscription created for user {user.id}")

        return subscription

    @staticmethod
    def has_feature_access(user, feature: str) -> bool:
        """
        Check if user has access to a specific feature.
        
        Args:
            user: User object
            feature: Feature name (e.g., 'mock_exams', 'ai_tutor')
        
        Returns:
            Boolean indicating access
        """
        subscription = SubscriptionService.get_user_subscription(user)
        
        if not subscription.is_active():
            return False

        # Check if plan has this feature
        if hasattr(subscription.plan, f'has_{feature}'):
            return getattr(subscription.plan, f'has_{feature}')

        return False

    @staticmethod
    def can_use_feature(user, feature: str) -> tuple[bool, str]:
        """
        Check if user can use a feature with reason.
        
        Args:
            user: User object
            feature: Feature name
        
        Returns:
            Tuple of (can_use: bool, reason: str)
        """
        subscription = SubscriptionService.get_user_subscription(user)
        
        if not subscription.is_active():
            return False, f"Subscription is {subscription.status}"

        if hasattr(subscription.plan, f'has_{feature}'):
            has_access = getattr(subscription.plan, f'has_{feature}')
            if not has_access:
                return False, f"Not available in {subscription.plan.display_name} plan"

        return True, "Feature available"
