import logging
from decimal import Decimal
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied

from .models import (
    SubscriptionPlan,
    UserSubscription,
    PaymentTransaction,
    Invoice,
    SubscriptionFeatureUsage
)
from .serializers import (
    SubscriptionPlanSerializer,
    UserSubscriptionSerializer,
    PaymentTransactionSerializer,
    InvoiceSerializer,
    SubscriptionFeatureUsageSerializer,
    SubscriptionStatusSerializer,
    SubscriptionRenewalSerializer,
    PaymentInitializationSerializer,
    PaymentVerificationSerializer,
    CancelSubscriptionSerializer,
)
from .services.paystack_service import PaystackService
from .services.subscription_service import SubscriptionService
from .services.invoice_service import InvoiceService

logger = logging.getLogger(__name__)


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing subscription plans.
    
    List all available subscription plans.
    """
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def comparison(self, request):
        """
        Get all plans for comparison.
        
        Returns all active plans with features and pricing details.
        """
        plans = self.get_queryset()
        serializer = self.get_serializer(plans, many=True)
        return Response({
            'plans': serializer.data,
            'currency': '₦',
            'message': 'Subscription plans comparison'
        })


class UserSubscriptionViewSet(viewsets.ViewSet):
    """
    ViewSet for managing user subscriptions.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """
        Get current user's subscription status.
        """
        try:
            subscription = request.user.user_subscription
        except UserSubscription.DoesNotExist:
            # Create free tier subscription for new users
            free_plan = SubscriptionPlan.objects.get(name='free')
            subscription = UserSubscription.objects.create(
                user=request.user,
                plan=free_plan,
                status='active'
            )

        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """
        Get subscription details (same as list for single subscription).
        """
        return self.list(request)

    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """
        Subscribe user to a plan.
        
        Request body:
        {
            "plan_id": 2,
            "enable_auto_renew": true
        }
        """
        serializer = SubscriptionRenewalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = get_object_or_404(
            SubscriptionPlan,
            id=serializer.validated_data['plan_id'],
            is_active=True
        )

        # If free plan, don't require payment
        if plan.name == 'free':
            subscription = UserSubscription.objects.filter(user=request.user).first()
            if subscription:
                subscription.plan = plan
                subscription.status = 'active'
                subscription.save()
            else:
                subscription = UserSubscription.objects.create(
                    user=request.user,
                    plan=plan,
                    status='active'
                )

            response_serializer = UserSubscriptionSerializer(subscription)
            return Response({
                'message': 'Successfully subscribed to free plan',
                'subscription': response_serializer.data
            }, status=status.HTTP_201_CREATED)

        # For paid plans, initiate payment
        return Response({
            'message': 'Paid subscription requires payment initialization',
            'payment_required': True,
            'next_step': 'Use /subscriptions/initiate-payment/ endpoint'
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='initiate-payment')
    def initiate_payment(self, request):
        """
        Initiate a payment for subscription.
        
        Request body:
        {
            "plan_id": 2,
            "email": "user@example.com",
            "enable_auto_renew": true
        }
        """
        serializer = PaymentInitializationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = get_object_or_404(
            SubscriptionPlan,
            id=serializer.validated_data['plan_id'],
            is_active=True
        )

        if plan.name == 'free':
            raise ValidationError('Cannot initiate payment for free plan')

        # Create payment transaction
        transaction = PaymentTransaction.objects.create(
            user=request.user,
            subscription_plan=plan,
            amount=plan.price,
            status='pending',
            payment_method='paystack'
        )

        # Initialize Paystack payment
        try:
            paystack_service = PaystackService()
            
            authorization_url = paystack_service.initialize_transaction(
                reference=transaction.paystack_reference,
                amount=int(plan.price * 100),  # Paystack uses kobo
                email=serializer.validated_data.get('email') or request.user.email,
                user_id=request.user.id,
                metadata={
                    'plan_id': plan.id,
                    'plan_name': plan.name,
                    'enable_auto_renew': serializer.validated_data['enable_auto_renew']
                }
            )

            transaction.paystack_reference = authorization_url['data']['reference']
            transaction.paystack_access_code = authorization_url['data']['access_code']
            transaction.gateway_response = authorization_url
            transaction.save()

            return Response({
                'message': 'Payment initialized successfully',
                'transaction_id': transaction.id,
                'paystack_reference': authorization_url['data']['reference'],
                'authorization_url': authorization_url['data']['authorization_url'],
                'access_code': authorization_url['data']['access_code'],
                'amount': float(plan.price),
                'plan': SubscriptionPlanSerializer(plan).data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            transaction.status = 'failed'
            transaction.error_message = str(e)
            transaction.save()
            logger.error(f"Payment initialization failed: {str(e)}")
            return Response({
                'error': 'Payment initialization failed',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        """
        Verify a payment using Paystack reference.
        
        Request body:
        {
            "reference": "paystack_reference_code"
        }
        """
        serializer = PaymentVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reference = serializer.validated_data['reference']

        try:
            transaction = get_object_or_404(
                PaymentTransaction,
                paystack_reference=reference,
                user=request.user
            )

            paystack_service = PaystackService()
            verification_result = paystack_service.verify_transaction(reference)

            if not verification_result['status']:
                transaction.status = 'failed'
                transaction.error_message = verification_result.get('message', 'Verification failed')
                transaction.save()
                return Response({
                    'message': 'Payment verification failed',
                    'status': False
                }, status=status.HTTP_400_BAD_REQUEST)

            # Payment successful
            transaction.status = 'completed'
            transaction.completed_at = timezone.now()
            transaction.paystack_authorization_code = verification_result['data'].get('authorization', {}).get('authorization_code')
            transaction.gateway_response = verification_result
            transaction.save()

            # Create or update subscription
            subscription_service = SubscriptionService()
            subscription = subscription_service.activate_subscription(
                user=request.user,
                plan=transaction.subscription_plan,
                payment_transaction=transaction,
                auto_renew=True
            )

            # Create invoice
            invoice_service = InvoiceService()
            invoice = invoice_service.create_invoice(
                user=request.user,
                payment_transaction=transaction
            )

            response_serializer = UserSubscriptionSerializer(subscription)
            return Response({
                'message': 'Payment verified and subscription activated',
                'subscription': response_serializer.data,
                'invoice_number': invoice.invoice_number
            }, status=status.HTTP_200_OK)

        except PaymentTransaction.DoesNotExist:
            return Response({
                'error': 'Transaction not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Payment verification failed: {str(e)}")
            return Response({
                'error': 'Payment verification failed',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def status(self, request):
        """
        Get user's subscription status with feature usage.
        """
        try:
            subscription = request.user.user_subscription
        except UserSubscription.DoesNotExist:
            free_plan = SubscriptionPlan.objects.get(name='free')
            subscription = UserSubscription.objects.create(
                user=request.user,
                plan=free_plan,
                status='active'
            )

        try:
            feature_usage = request.user.subscription_feature_usage
        except SubscriptionFeatureUsage.DoesNotExist:
            feature_usage = SubscriptionFeatureUsage.objects.create(
                user=request.user
            )

        data = {
            'user_subscription': subscription,
            'feature_usage': feature_usage
        }

        serializer = SubscriptionStatusSerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def cancel(self, request):
        """
        Cancel user's subscription.
        
        Request body:
        {
            "reason": "Optional cancellation reason"
        }
        """
        serializer = CancelSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            subscription = request.user.user_subscription
        except UserSubscription.DoesNotExist:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)

        subscription.cancel()
        
        response_serializer = UserSubscriptionSerializer(subscription)
        return Response({
            'message': 'Subscription cancelled successfully',
            'subscription': response_serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def upgrade(self, request):
        """
        Upgrade to a higher tier subscription.
        
        Request body:
        {
            "plan_id": 3,
            "enable_auto_renew": true
        }
        """
        serializer = SubscriptionRenewalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = get_object_or_404(
            SubscriptionPlan,
            id=serializer.validated_data['plan_id'],
            is_active=True
        )

        try:
            subscription = request.user.user_subscription
        except UserSubscription.DoesNotExist:
            return Response({
                'error': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)

        if plan.price == 0:
            raise ValidationError('Cannot upgrade to free plan')

        subscription_service = SubscriptionService()
        subscription = subscription_service.upgrade_subscription(
            subscription=subscription,
            new_plan=plan
        )

        response_serializer = UserSubscriptionSerializer(subscription)
        return Response({
            'message': 'Subscription upgraded successfully',
            'subscription': response_serializer.data
        }, status=status.HTTP_200_OK)


class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing payment transactions.
    """
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only transactions for the current user."""
        return PaymentTransaction.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending transactions for current user."""
        transactions = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get all completed transactions for current user."""
        transactions = self.get_queryset().filter(status='completed')
        serializer = self.get_serializer(transactions, many=True)
        return Response(serializer.data)


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing invoices.
    """
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only invoices for the current user."""
        return Invoice.objects.filter(user=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download invoice PDF.
        """
        invoice = self.get_object()
        
        if not invoice.pdf_file:
            return Response({
                'error': 'Invoice PDF not yet generated'
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'pdf_url': invoice.pdf_file.url,
            'invoice_number': invoice.invoice_number
        })


class SubscriptionFeatureUsageViewSet(viewsets.ViewSet):
    """
    ViewSet for checking feature usage.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Get current feature usage."""
        try:
            usage = request.user.subscription_feature_usage
        except SubscriptionFeatureUsage.DoesNotExist:
            usage = SubscriptionFeatureUsage.objects.create(user=request.user)

        serializer = SubscriptionFeatureUsageSerializer(usage)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def can_access_feature(self, request):
        """
        Check if user can access a feature.
        
        Query params:
            feature: 'questions', 'mock_exams', 'ai_tutor', etc.
        """
        feature = request.query_params.get('feature')

        if not feature:
            raise ValidationError('Feature parameter is required')

        # Superusers have access to everything
        if request.user.is_superuser:
            return Response({
                'feature': feature,
                'can_access': True,
                'subscription_plan': 'Admin Access'
            })

        try:
            subscription = request.user.user_subscription
        except UserSubscription.DoesNotExist:
            return Response({
                'can_access': False,
                'message': 'No active subscription'
            })

        if not subscription.is_active():
            return Response({
                'can_access': False,
                'message': 'Subscription is not active'
            })

        # Check feature access
        can_access = getattr(subscription.plan, f'has_{feature}', False)
        
        if not can_access and feature == 'questions':
            # Check daily question limit
            try:
                usage = request.user.subscription_feature_usage
            except SubscriptionFeatureUsage.DoesNotExist:
                usage = SubscriptionFeatureUsage.objects.create(user=request.user)

            can_access = usage.can_access_question()

        return Response({
            'feature': feature,
            'can_access': can_access,
            'subscription_plan': subscription.plan.display_name
        })
