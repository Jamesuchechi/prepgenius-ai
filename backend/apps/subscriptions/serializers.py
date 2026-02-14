from rest_framework import serializers
from django.utils import timezone
from .models import (
    SubscriptionPlan,
    UserSubscription,
    PaymentTransaction,
    Invoice,
    SubscriptionFeatureUsage
)


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Serializer for SubscriptionPlan."""
    features = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionPlan
        fields = [
            'id',
            'name',
            'display_name',
            'price',
            'duration_days',
            'questions_per_day',
            'has_mock_exams',
            'has_ai_tutor',
            'has_audio_mode',
            'has_document_mode',
            'has_offline_mode',
            'has_premium_content',
            'has_priority_support',
            'study_sessions_per_month',
            'max_topics',
            'description',
            'features',
            'is_active',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_features(self, obj):
        """Get list of features for this plan."""
        return obj.get_features_list()


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for UserSubscription."""
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    is_active = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = UserSubscription
        fields = [
            'id',
            'user',
            'plan',
            'plan_details',
            'status',
            'started_at',
            'expires_at',
            'cancelled_at',
            'last_payment_date',
            'next_billing_date',
            'auto_renew',
            'is_active',
            'days_remaining',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'paystack_authorization_code',
            'paystack_customer_code',
            'paystack_subscription_code',
            'created_at',
            'updated_at',
        ]

    def get_is_active(self, obj):
        """Check if subscription is active."""
        return obj.is_active()

    def get_days_remaining(self, obj):
        """Get days remaining in subscription."""
        return obj.days_remaining()


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Serializer for PaymentTransaction."""
    plan_details = SubscriptionPlanSerializer(source='subscription_plan', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id',
            'user',
            'subscription_plan',
            'plan_details',
            'amount',
            'status',
            'payment_method',
            'paystack_reference',
            'gateway_response',
            'error_message',
            'created_at',
            'completed_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'paystack_reference',
            'paystack_access_code',
            'paystack_authorization_code',
            'gateway_response',
            'created_at',
            'completed_at',
            'updated_at',
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice."""
    transaction_details = PaymentTransactionSerializer(
        source='payment_transaction',
        read_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            'id',
            'user',
            'invoice_number',
            'status',
            'subtotal',
            'tax',
            'total',
            'issue_date',
            'due_date',
            'paid_date',
            'description',
            'pdf_file',
            'transaction_details',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'invoice_number',
            'pdf_file',
            'issue_date',
            'created_at',
            'updated_at',
        ]


class SubscriptionFeatureUsageSerializer(serializers.ModelSerializer):
    """Serializer for SubscriptionFeatureUsage."""
    
    class Meta:
        model = SubscriptionFeatureUsage
        fields = [
            'id',
            'user',
            'questions_used_today',
            'study_sessions_this_month',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'updated_at']


class PlanComparisonSerializer(serializers.Serializer):
    """Serializer for comparing different subscription plans."""
    plans = SubscriptionPlanSerializer(many=True)

    def to_representation(self, data):
        """Transform the representation to include all plans."""
        return SubscriptionPlanSerializer(data, many=True).data


class SubscriptionStatusSerializer(serializers.Serializer):
    """Serializer for subscription status response."""
    user_subscription = UserSubscriptionSerializer()
    feature_usage = SubscriptionFeatureUsageSerializer()
    has_active_subscription = serializers.SerializerMethodField()

    def get_has_active_subscription(self, obj):
        """Check if user has active subscription."""
        if 'user_subscription' in obj:
            return obj['user_subscription'].is_active()
        return False


class SubscriptionRenewalSerializer(serializers.Serializer):
    """Serializer for subscription renewal request."""
    plan_id = serializers.IntegerField()
    enable_auto_renew = serializers.BooleanField(default=True)

    def validate_plan_id(self, value):
        """Validate that plan exists and is active."""
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Selected plan does not exist or is inactive.")
        return value


class PaymentInitializationSerializer(serializers.Serializer):
    """Serializer for initializing a payment."""
    plan_id = serializers.IntegerField()
    email = serializers.EmailField(required=False, allow_blank=True)
    enable_auto_renew = serializers.BooleanField(default=True)

    def validate_plan_id(self, value):
        """Validate that plan exists and is active."""
        try:
            plan = SubscriptionPlan.objects.get(id=value, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError("Selected plan does not exist or is inactive.")
        return value


class PaymentVerificationSerializer(serializers.Serializer):
    """Serializer for payment verification."""
    reference = serializers.CharField(max_length=255)


class CancelSubscriptionSerializer(serializers.Serializer):
    """Serializer for subscription cancellation."""
    reason = serializers.CharField(required=False, allow_blank=True)
