from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class SubscriptionPlan(models.Model):
    """
    Represents different subscription tiers available to users.
    """
    PLAN_TIER_CHOICES = [
        ('free', 'Free'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annual', 'Annual'),
    ]

    name = models.CharField(max_length=50, unique=True, choices=PLAN_TIER_CHOICES)
    display_name = models.CharField(max_length=100, help_text="User-friendly plan name")
    
    # Pricing (in Naira)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Price in ₦"
    )
    
    # Duration in days (0 for free tier)
    duration_days = models.PositiveIntegerField(
        default=0,
        help_text="Duration in days (0 for free/unlimited)"
    )
    
    # Feature limits
    questions_per_day = models.PositiveIntegerField(
        default=10,
        help_text="Number of questions user can access per day"
    )
    
    # Boolean features
    has_mock_exams = models.BooleanField(
        default=False,
        help_text="Access to mock exams"
    )
    
    has_ai_tutor = models.BooleanField(
        default=False,
        help_text="Access to AI tutor"
    )
    
    has_audio_mode = models.BooleanField(
        default=False,
        help_text="Access to audio learning mode"
    )
    
    has_document_mode = models.BooleanField(
        default=False,
        help_text="Access to document analysis mode"
    )
    
    has_offline_mode = models.BooleanField(
        default=False,
        help_text="Access to offline learning"
    )
    
    has_premium_content = models.BooleanField(
        default=False,
        help_text="Access to premium learning materials"
    )
    
    has_priority_support = models.BooleanField(
        default=False,
        help_text="Priority customer support"
    )
    
    # Limits on other features
    study_sessions_per_month = models.PositiveIntegerField(
        default=0,
        help_text="0 means unlimited"
    )
    
    max_topics = models.PositiveIntegerField(
        default=0,
        help_text="Maximum topics user can study (0 for unlimited)"
    )
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions_plan'
        ordering = ['duration_days', 'price']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.display_name} (₦{self.price})"

    def get_features_list(self):
        """Return list of features for this plan."""
        features = []
        if self.questions_per_day > 0:
            features.append(f"{self.questions_per_day} questions/day")
        if self.has_mock_exams:
            features.append("Mock Exams")
        if self.has_ai_tutor:
            features.append("AI Tutor")
        if self.has_audio_mode:
            features.append("Audio Mode")
        if self.has_document_mode:
            features.append("Document Mode")
        if self.has_offline_mode:
            features.append("Offline Mode")
        if self.has_premium_content:
            features.append("Premium Content")
        if self.has_priority_support:
            features.append("Priority Support")
        return features


class UserSubscription(models.Model):
    """
    Tracks user's subscription status and billing cycle.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('cancelled', 'Cancelled'),
        ('suspended', 'Suspended'),
        ('expired', 'Expired'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_subscription'
    )
    
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='users'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='inactive'
    )
    
    # Billing cycle
    started_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="When subscription expires")
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Payment tracking
    last_payment_date = models.DateTimeField(null=True, blank=True)
    next_billing_date = models.DateTimeField(null=True, blank=True)
    
    # Paystack reference
    paystack_authorization_code = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Authorization code from Paystack for recurring charges"
    )
    
    paystack_customer_code = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Customer code from Paystack"
    )
    
    paystack_subscription_code = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Paystack subscription code for recurring billing"
    )
    
    # Auto-renewal
    auto_renew = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions_user_subscription'
        verbose_name = 'User Subscription'
        verbose_name_plural = 'User Subscriptions'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['plan']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.plan.display_name}"

    def is_active(self):
        """Check if subscription is currently active."""
        if self.status != 'active':
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        return True

    def days_remaining(self):
        """Calculate days remaining in subscription."""
        if not self.expires_at:
            return None
        delta = self.expires_at - timezone.now()
        return max(0, delta.days)

    def renew(self, plan=None):
        """Renew or upgrade subscription."""
        if plan:
            self.plan = plan
        
        # Set new expiration date
        if self.plan.duration_days > 0:
            self.expires_at = timezone.now() + timezone.timedelta(days=self.plan.duration_days)
            self.next_billing_date = self.expires_at
        
        self.status = 'active'
        self.save()

    def cancel(self):
        """Cancel the subscription."""
        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.auto_renew = False
        self.save()

    def suspend(self):
        """Suspend the subscription (e.g., for non-payment)."""
        self.status = 'suspended'
        self.save()


class PaymentTransaction(models.Model):
    """
    Tracks all payment transactions.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('paystack', 'Paystack'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('manual', 'Manual'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_transactions'
    )
    
    subscription_plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    
    user_subscription = models.ForeignKey(
        UserSubscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    
    # Amount
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='paystack'
    )
    
    # Paystack reference
    paystack_reference = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text="Paystack transaction reference"
    )
    
    paystack_access_code = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    
    paystack_authorization_code = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    
    # Transaction metadata
    gateway_response = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions_payment_transaction'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['paystack_reference']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - ₦{self.amount} - {self.status}"


class Invoice(models.Model):
    """
    Generates and stores invoices for transactions.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('issued', 'Issued'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    
    payment_transaction = models.OneToOneField(
        PaymentTransaction,
        on_delete=models.PROTECT,
        related_name='invoice'
    )
    
    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        help_text="Invoice reference number"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    
    # Amounts
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Dates
    issue_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    paid_date = models.DateTimeField(null=True, blank=True)
    
    # Notes
    description = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    # PDF file
    pdf_file = models.FileField(
        upload_to='invoices/',
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions_invoice'
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['invoice_number']),
        ]

    def __str__(self):
        return f"Invoice {self.invoice_number}"

    def mark_as_paid(self):
        """Mark invoice as paid."""
        self.status = 'paid'
        self.paid_date = timezone.now()
        self.save()


class SubscriptionFeatureUsage(models.Model):
    """
    Tracks feature usage for the current day/month to enforce limits.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscription_feature_usage'
    )
    
    # Daily limits (reset at midnight)
    questions_used_today = models.PositiveIntegerField(default=0)
    last_questions_reset = models.DateField(auto_now_add=True)
    
    # Monthly limits (reset on billing date)
    study_sessions_this_month = models.PositiveIntegerField(default=0)
    last_sessions_reset = models.DateField(auto_now_add=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions_feature_usage'
        verbose_name = 'Subscription Feature Usage'
        verbose_name_plural = 'Subscription Feature Usages'

    def __str__(self):
        return f"{self.user.email} - Usage"

    def reset_daily_limits(self):
        """Reset daily limits if needed."""
        from datetime import date
        if self.last_questions_reset < date.today():
            self.questions_used_today = 0
            self.last_questions_reset = date.today()
            self.save()

    def can_access_question(self):
        """Check if user can access another question."""
        # Superusers have unlimited access
        if self.user.is_superuser:
            return True

        self.reset_daily_limits()
        
        # Free tier users have daily limit
        if hasattr(self.user, 'user_subscription'):
            subscription = self.user.user_subscription
            if subscription.is_active() and subscription.plan.questions_per_day > 0:
                return self.questions_used_today < subscription.plan.questions_per_day
        
        return True

    def increment_question_usage(self):
        """Increment question usage counter."""
        self.reset_daily_limits()
        self.questions_used_today += 1
        self.save()
