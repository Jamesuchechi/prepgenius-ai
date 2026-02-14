# Subscription System Documentation

## Overview

The PrepGenius AI subscription system manages user access to premium features through flexible subscription plans. It integrates with Paystack for seamless payment processing and includes comprehensive feature gating.

## Architecture

### Models

The subscription system uses five main models:

1. **SubscriptionPlan** - Defines available subscriptions
   - Free tier: Limited to 10 questions/day
   - Monthly: ₦2,500 - Unlimited questions + mock exams + AI tutor
   - Quarterly: ₦6,000 - Monthly features + priority support
   - Annual: ₦20,000 - All features including offline mode, audio, documents

2. **UserSubscription** - Tracks individual user subscriptions
   - Status: active, inactive, cancelled, suspended, expired
   - Auto-renewal support
   - Paystack integration codes

3. **PaymentTransaction** - Records all payment attempts
   - Tracks transaction status
   - Stores Paystack reference codes
   - Maintains gateway responses

4. **Invoice** - Generates billing documents
   - Automatic invoice number generation
   - PDF generation support
   - Payment tracking

5. **SubscriptionFeatureUsage** - Enforces daily/monthly limits
   - Tracks daily question usage
   - Resets on schedule
   - Prevents overage

### Services

**PaystackService** (`services/paystack_service.py`)
- Payment initialization
- Transaction verification  
- Customer management
- Recurring billing setup
- Subscription management

**SubscriptionService** (`services/subscription_service.py`)
- Subscription activation/renewal
- Upgrade/downgrade handling
- Expiration checking
- Feature access validation
- Daily limit enforcement

**InvoiceService** (`services/invoice_service.py`)
- Invoice generation
- PDF creation
- Invoice tracking
- Statistics reporting

## API Endpoints

### Subscription Plans
```
GET /api/subscriptions/plans/
    - List all active subscription plans with features

GET /api/subscriptions/plans/comparison/
    - Get detailed comparison of all plans
```

### User Subscription Management
```
GET /api/subscriptions/my-subscription/
    - Get current user's subscription status

POST /api/subscriptions/my-subscription/subscribe/
    - Subscribe to a plan (free tier only, requires no payment)
    - Body: {"plan_id": 1, "enable_auto_renew": true}

POST /api/subscriptions/my-subscription/initiate-payment/
    - Start payment process for paid plans
    - Body: {"plan_id": 2, "email": "user@example.com"}
    - Returns: Paystack authorization URL

POST /api/subscriptions/my-subscription/verify-payment/
    - Confirm payment and activate subscription
    - Body: {"reference": "paystack_reference"}

GET /api/subscriptions/my-subscription/status/
    - Get subscription + feature usage details

POST /api/subscriptions/my-subscription/cancel/
    - Cancel active subscription
    - Body: {"reason": "optional"}

POST /api/subscriptions/my-subscription/upgrade/
    - Upgrade to higher tier
    - Body: {"plan_id": 3}
```

### Payment & Invoices
```
GET /api/subscriptions/transactions/
    - List all user's transactions

GET /api/subscriptions/transactions/pending/
    - List pending transactions

GET /api/subscriptions/transactions/completed/
    - List completed transactions

GET /api/subscriptions/invoices/
    - List all user's invoices

GET /api/subscriptions/invoices/{id}/download/
    - Download invoice PDF
```

### Feature Access
```
GET /api/subscriptions/feature-usage/
    - Get current feature usage limits

GET /api/subscriptions/feature-usage/can-access-feature/?feature=mock_exams
    - Check if user can access specific feature
```

### Webhooks
```
POST /api/webhooks/paystack/
    - Paystack webhook endpoint (no auth required)
    - Handles: charge.success, charge.failed, subscription events
```

## Feature Gating

### Using Decorators

```python
from apps.subscriptions.permissions import require_subscription_feature

# In views.py
@require_subscription_feature('mock_exams')
def create_mock_exam(request):
    # Only accessible to users with mock_exams feature
    pass

@require_paid_subscription
def premium_feature(request):
    # Only for non-free users
    pass
```

### Checking Access Programmatically

```python
from apps.subscriptions.permissions import check_feature_access, get_subscription_status

# Check specific feature
can_access, reason = check_feature_access(user, 'ai_tutor')

# Get full subscription info
subscription_info = get_subscription_status(user)
```

### Mixin for ViewSets

```python
from apps.subscriptions.permissions import FeatureGateMixin

class MockExamViewSet(FeatureGateMixin, ViewSet):
    required_feature = 'mock_exams'
    # Automatically checks feature access on all actions
```

## Daily Usage Limits

The system automatically enforces daily limits for free tier users:

```python
from apps.subscriptions.permissions import enforce_daily_limit

@enforce_daily_limit('questions_per_day')
def generate_question(request):
    # Automatically checked before execution
    # Incremented after success
    pass
```

### Manual Limit Checking

```python
from apps.subscriptions.models import SubscriptionFeatureUsage

usage = user.subscription_feature_usage
usage.reset_daily_limits()

if usage.can_access_question():
    # User can access another question
    usage.increment_question_usage()
```

## Payment Flow

### Step 1: Initialize Payment
```
POST /api/subscriptions/my-subscription/initiate-payment/
{
    "plan_id": 2,
    "email": "user@example.com",
    "enable_auto_renew": true
}
```

Response includes:
- Paystack authorization URL
- Transaction reference
- Access code

### Step 2: Redirect to Payment
User redirected to Paystack payment page

### Step 3: Verify Payment
```
POST /api/subscriptions/my-subscription/verify-payment/
{
    "reference": "paystack_reference"
}
```

Automatically:
- Verifies with Paystack
- Creates subscription
- Generates invoice
- Sends confirmation

## Paystack Webhooks

Paystack sends events to `/api/webhooks/paystack/`:

- **charge.success** - Payment successful, activate subscription
- **charge.failed** - Mark transaction as failed
- **subscription.create** - Store Paystack codes
- **subscription.disable** - Cancel subscription

Signature verification ensures security.

## Database Seeding

Create default plans:

```bash
python manage.py seed_subscription_plans
```

This creates:
- Free tier (₦0)
- Monthly (₦2,500)
- Quarterly (₦6,000)
- Annual (₦20,000)

## Environment Variables

```env
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

## Admin Interface

Django admin available at `/admin/`:

- Create/edit subscription plans
- View user subscriptions
- Monitor transactions and invoices
- Check feature usage
- Manage plan features

## Testing

### Test Paystack Integration
```python
# In Django shell
from apps.subscriptions.services.paystack_service import PaystackService
service = PaystackService()
result = service.initialize_transaction(
    amount=250000,  # ₦2,500 in kobo
    email='test@example.com',
)
```

### Check Feature Access
```python
from apps.subscriptions.permissions import check_feature_access

has_access, reason = check_feature_access(user, 'mock_exams')
print(f"Can access: {has_access}, Reason: {reason}")
```

## Best Practices

1. **Always check subscription before granting access**
   - Use decorators or manual checks
   - Don't bypass feature gates

2. **Handle subscription expiration**
   - Run expiration check periodically (Celery task)
   - Gracefully downgrade to free tier

3. **Store Paystack codes**
   - Required for recurring charges
   - Needed for subscription management

4. **Log important events**
   - Payment attempts
   - Subscription changes
   - Feature access denials

5. **Test payment flow thoroughly**
   - Use Paystack test credentials
   - Test webhook handling
   - Verify all transaction states

## Future Enhancements

- [ ] Promo codes and discounts
- [ ] Usage analytics dashboard
- [ ] Automated invoice PDF generation
- [ ] Dunning/retry for failed payments
- [ ] Student group/institutional plans
- [ ] API rate limiting by tier
- [ ] Referral rewards
- [ ] Subscription analytics for admins
