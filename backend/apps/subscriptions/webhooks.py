import logging
import hmac
import hashlib
import json
from decimal import Decimal
from django.conf import settings
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import PaymentTransaction, UserSubscription, SubscriptionPlan
from .services.subscription_service import SubscriptionService
from .services.invoice_service import InvoiceService

logger = logging.getLogger(__name__)


def verify_paystack_signature(request_body, signature_header):
    """
    Verify that the webhook request came from Paystack.
    
    Args:
        request_body: Request body as bytes
        signature_header: X-Paystack-Signature header value
    
    Returns:
        Boolean indicating if signature is valid
    """
    secret_key = settings.PAYSTACK_SECRET_KEY.encode()
    hash_object = hmac.new(
        secret_key,
        msg=request_body,
        digestmod=hashlib.sha512
    )
    hash_digest = hash_object.hexdigest()
    
    return hash_digest == signature_header


@csrf_exempt
@require_http_methods(["POST"])
def paystack_webhook(request):
    """
    Handle Paystack webhook events.
    
    Paystack will POST to this endpoint to notify us about payment events:
    - charge.success: Payment was successful
    - charge.failed: Payment failed
    - subscription.create: Subscription created
    - subscription.disable: Subscription cancelled
    """
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        logger.error("Invalid JSON in webhook request")
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    # Verify webhook signature
    signature = request.headers.get('X-Paystack-Signature', '')
    if not verify_paystack_signature(request.body, signature):
        logger.warning("Webhook signature verification failed")
        return JsonResponse({'status': 'error', 'message': 'Invalid signature'}, status=403)

    event = payload.get('event')
    data = payload.get('data', {})

    try:
        if event == 'charge.success':
            handle_charge_success(data)
        elif event == 'charge.failed':
            handle_charge_failed(data)
        elif event == 'subscription.create':
            handle_subscription_create(data)
        elif event == 'subscription.disable':
            handle_subscription_disable(data)
        else:
            logger.info(f"Unhandled webhook event: {event}")

        return JsonResponse({'status': 'success'}, status=200)

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return JsonResponse(
            {'status': 'error', 'message': str(e)},
            status=500
        )


def handle_charge_success(data):
    """
    Handle successful charge event.
    
    Args:
        data: Webhook data from Paystack
    """
    reference = data.get('reference')
    
    try:
        transaction = PaymentTransaction.objects.get(paystack_reference=reference)
    except PaymentTransaction.DoesNotExist:
        logger.error(f"Transaction not found for reference: {reference}")
        return

    # Update transaction
    transaction.status = 'completed'
    transaction.completed_at = timezone.now()
    transaction.paystack_authorization_code = data.get('authorization', {}).get('authorization_code')
    transaction.gateway_response = data
    transaction.save()

    # Create or update subscription
    plan = transaction.subscription_plan
    user = transaction.user

    subscription = SubscriptionService.activate_subscription(
        user=user,
        plan=plan,
        payment_transaction=transaction,
        auto_renew=True
    )

    # Create invoice
    invoice = InvoiceService.create_invoice(
        user=user,
        payment_transaction=transaction
    )

    logger.info(f"Charge successful for user {user.id} - Transaction: {reference}")


def handle_charge_failed(data):
    """
    Handle failed charge event.
    
    Args:
        data: Webhook data from Paystack
    """
    reference = data.get('reference')

    try:
        transaction = PaymentTransaction.objects.get(paystack_reference=reference)
    except PaymentTransaction.DoesNotExist:
        logger.error(f"Transaction not found for reference: {reference}")
        return

    # Update transaction
    transaction.status = 'failed'
    transaction.error_message = data.get('gateway_response', 'Payment failed')
    transaction.gateway_response = data
    transaction.save()

    logger.warning(f"Charge failed for user {transaction.user.id} - Transaction: {reference}")


def handle_subscription_create(data):
    """
    Handle subscription creation event.
    
    Args:
        data: Webhook data from Paystack
    """
    customer_code = data.get('customer', {}).get('customer_code')
    subscription_code = data.get('subscription_code')
    reference = data.get('reference')

    try:
        transaction = PaymentTransaction.objects.get(paystack_reference=reference)
    except PaymentTransaction.DoesNotExist:
        logger.error(f"Transaction not found for reference: {reference}")
        return

    # Update subscription with Paystack codes
    user = transaction.user
    
    try:
        subscription = user.user_subscription
    except UserSubscription.DoesNotExist:
        subscription = UserSubscription.objects.create(
            user=user,
            plan=transaction.subscription_plan,
            status='active'
        )

    subscription.paystack_customer_code = customer_code
    subscription.paystack_subscription_code = subscription_code
    subscription.save()

    logger.info(f"Subscription created for user {user.id} - Code: {subscription_code}")


def handle_subscription_disable(data):
    """
    Handle subscription cancellation event.
    
    Args:
        data: Webhook data from Paystack
    """
    subscription_code = data.get('subscription_code')

    try:
        subscription = UserSubscription.objects.get(paystack_subscription_code=subscription_code)
    except UserSubscription.DoesNotExist:
        logger.error(f"Subscription not found for code: {subscription_code}")
        return

    # Cancel subscription
    subscription.cancel()
    logger.info(f"Subscription cancelled for user {subscription.user.id}")
