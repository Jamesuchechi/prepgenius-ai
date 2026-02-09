from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, EmailVerificationToken, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin configuration."""
    
    list_display = [
        'email', 'first_name', 'last_name', 'student_type',
        'is_email_verified', 'is_active', 'created_at'
    ]
    list_filter = [
        'is_active', 'is_email_verified', 'student_type',
        'grade_level', 'created_at'
    ]
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Account Information', {
            'fields': ('email', 'first_name', 'last_name', 'password')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'bio')
        }),
        ('Profile Picture', {
            'fields': ('profile_picture',)
        }),
        ('Student Information', {
            'fields': ('student_type', 'grade_level', 'exam_targets')
        }),
        ('Email Verification', {
            'fields': ('is_email_verified', 'email_verified_at')
        }),
        ('Preferences', {
            'fields': ('timezone', 'language')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'last_login_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login_date')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'first_name', 'last_name', 'password1', 'password2',
                'student_type', 'grade_level', 'exam_targets'
            ),
        }),
    )


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Admin configuration for email verification tokens."""
    
    list_display = ['user', 'is_used', 'created_at', 'expires_at']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['token', 'created_at', 'used_at']
    
    fieldsets = (
        ('Token Information', {
            'fields': ('user', 'token')
        }),
        ('Status', {
            'fields': ('is_used', 'used_at')
        }),
        ('Timing', {
            'fields': ('created_at', 'expires_at')
        }),
    )


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin configuration for password reset tokens."""
    
    list_display = ['user', 'is_used', 'created_at', 'expires_at']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['token', 'created_at', 'used_at']
    
    fieldsets = (
        ('Token Information', {
            'fields': ('user', 'token')
        }),
        ('Status', {
            'fields': ('is_used', 'used_at')
        }),
        ('Timing', {
            'fields': ('created_at', 'expires_at')
        }),
    )
