from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    SubscriptionPlanViewSet,
    UserSubscriptionViewSet,
    PaymentTransactionViewSet,
    InvoiceViewSet,
    SubscriptionFeatureUsageViewSet,
)

app_name = 'subscriptions'

router = SimpleRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register(r'my-subscription', UserSubscriptionViewSet, basename='user-subscription')
router.register(r'transactions', PaymentTransactionViewSet, basename='payment-transaction')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'feature-usage', SubscriptionFeatureUsageViewSet, basename='feature-usage')

urlpatterns = [
    path('', include(router.urls)),
]
