from django.urls import path
from . import webhooks

app_name = 'webhooks'

urlpatterns = [
    path('paystack/', webhooks.paystack_webhook, name='paystack-webhook'),
]
