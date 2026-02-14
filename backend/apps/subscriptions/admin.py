from django.contrib import admin
from django.utils.html import format_html
from .models import (
    SubscriptionPlan,
    UserSubscription,
    PaymentTransaction,
    Invoice,
    SubscriptionFeatureUsage
)


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = [
        'display_name',
        'name',
        'price_display',
        'duration_days',
        'questions_per_day',
        'has_mock_exams',
        'has_ai_tutor',
        'is_active'
    ]
    list_filter = ['name', 'is_active', 'has_mock_exams', 'has_ai_tutor']
    search_fields = ['display_name', 'name']
    ordering = ['duration_days', 'price']

    fieldsets = (
        ('Plan Information', {
            'fields': ('name', 'display_name', 'description', 'is_active')
        }),
        ('Pricing & Duration', {
            'fields': ('price', 'duration_days')
        }),
        ('Feature Limits', {
            'fields': ('questions_per_day', 'study_sessions_per_month', 'max_topics')
        }),
        ('Features', {
            'fields': (
                'has_mock_exams',
                'has_ai_tutor',
                'has_audio_mode',
                'has_document_mode',
                'has_offline_mode',
                'has_premium_content',
                'has_priority_support'
            )
        }),
    )

    def price_display(self, obj):
        return f"₦{obj.price}"
    price_display.short_description = 'Price'


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'user_email',
        'plan_name',
        'status_badge',
        'started_at',
        'expires_at',
        'auto_renew',
        'last_payment_date'
    ]
    list_filter = ['status', 'plan', 'auto_renew', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    ordering = ['-created_at']

    readonly_fields = [
        'user',
        'created_at',
        'updated_at',
        'paystack_customer_code',
        'paystack_subscription_code'
    ]

    fieldsets = (
        ('User & Plan', {
            'fields': ('user', 'plan', 'status', 'auto_renew')
        }),
        ('Subscription Timeline', {
            'fields': ('started_at', 'expires_at', 'cancelled_at', 'last_payment_date', 'next_billing_date')
        }),
        ('Paystack Integration', {
            'fields': ('paystack_authorization_code', 'paystack_customer_code', 'paystack_subscription_code'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'

    def plan_name(self, obj):
        return obj.plan.display_name
    plan_name.short_description = 'Subscription Plan'

    def status_badge(self, obj):
        colors = {
            'active': 'green',
            'inactive': 'red',
            'cancelled': 'gray',
            'suspended': 'orange',
            'expired': 'red'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = [
        'user_email',
        'subscription_plan',
        'amount_display',
        'status_badge',
        'payment_method',
        'created_at'
    ]
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['user__email', 'paystack_reference']
    ordering = ['-created_at']

    readonly_fields = [
        'user',
        'created_at',
        'updated_at',
        'completed_at',
        'gateway_response'
    ]

    fieldsets = (
        ('Transaction Details', {
            'fields': ('user', 'subscription_plan', 'amount', 'status', 'payment_method')
        }),
        ('Payment Information', {
            'fields': ('paystack_reference', 'paystack_access_code', 'paystack_authorization_code', 'error_message')
        }),
        ('Timeline', {
            'fields': ('created_at', 'completed_at', 'updated_at')
        }),
        ('Response Data', {
            'fields': ('gateway_response',),
            'classes': ('collapse',)
        }),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'

    def amount_display(self, obj):
        return f"₦{obj.amount}"
    amount_display.short_description = 'Amount'

    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'completed': 'green',
            'failed': 'red',
            'refunded': 'blue',
            'cancelled': 'gray'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'invoice_number',
        'user_email',
        'total_display',
        'status_badge',
        'issue_date',
        'due_date'
    ]
    list_filter = ['status', 'issue_date']
    search_fields = ['invoice_number', 'user__email']
    ordering = ['-issue_date']

    readonly_fields = [
        'invoice_number',
        'user',
        'issue_date',
        'created_at',
        'updated_at'
    ]

    fieldsets = (
        ('Invoice Details', {
            'fields': ('invoice_number', 'user', 'payment_transaction', 'status')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax', 'total')
        }),
        ('Timeline', {
            'fields': ('issue_date', 'due_date', 'paid_date')
        }),
        ('Additional Information', {
            'fields': ('description', 'notes', 'pdf_file'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'

    def total_display(self, obj):
        return f"₦{obj.total}"
    total_display.short_description = 'Total Amount'

    def status_badge(self, obj):
        colors = {
            'draft': 'gray',
            'issued': 'blue',
            'paid': 'green',
            'overdue': 'red',
            'cancelled': 'gray'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(SubscriptionFeatureUsage)
class SubscriptionFeatureUsageAdmin(admin.ModelAdmin):
    list_display = [
        'user_email',
        'questions_used_today',
        'study_sessions_this_month',
        'updated_at'
    ]
    search_fields = ['user__email']
    ordering = ['-updated_at']

    readonly_fields = ['user', 'updated_at']

    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Daily Usage', {
            'fields': ('questions_used_today', 'last_questions_reset')
        }),
        ('Monthly Usage', {
            'fields': ('study_sessions_this_month', 'last_sessions_reset')
        }),
        ('Updated', {
            'fields': ('updated_at',),
            'classes': ('collapse',)
        }),
    )

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
