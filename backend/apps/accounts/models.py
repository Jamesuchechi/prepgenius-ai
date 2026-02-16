from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from .managers import CustomUserManager


class User(AbstractUser):
    """Custom User model with additional fields for exam preparation."""
    
    # Student profile fields
    STUDENT_TYPE_CHOICES = [
        ('individual', 'Individual Student'),
        ('institutional', 'Institutional Student'),
    ]
    
    GRADE_LEVEL_CHOICES = [
        ('ss1', 'Senior Secondary 1'),
        ('ss2', 'Senior Secondary 2'),
        ('ss3', 'Senior Secondary 3'),
        ('post_secondary', 'Post-Secondary'),
    ]
    
    EXAM_TARGET_CHOICES = [
        ('jamb', 'JAMB'),
        ('waec', 'WAEC'),
        ('neco', 'NECO'),
        ('utme', 'UTME'),
        ('post_utme', 'Post-UTME'),
    ]
    
    # Override default email to be required and unique
    email = models.EmailField(unique=True, blank=False)
    
    # Profile fields
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )
    cover_picture = models.ImageField(
        upload_to='cover_pictures/',
        blank=True,
        null=True
    )
    bio = models.TextField(blank=True, null=True, max_length=500)
    
    # Student type and exam info
    student_type = models.CharField(
        max_length=20,
        choices=STUDENT_TYPE_CHOICES,
        default='individual'
    )
    grade_level = models.CharField(
        max_length=20,
        choices=GRADE_LEVEL_CHOICES,
        blank=True,
        null=True
    )
    exam_targets = models.JSONField(
        default=list,
        help_text="List of exam targets e.g., ['jamb', 'post_utme']"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_date = models.DateTimeField(null=True, blank=True)
    
    # Account status
    is_email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Preferences
    timezone = models.CharField(max_length=50, default='UTC', blank=True)
    language = models.CharField(max_length=10, default='en', blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'accounts_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def save(self, *args, **kwargs):
        # Use email as username
        self.username = self.email
        super().save(*args, **kwargs)


class EmailVerificationToken(models.Model):
    """Model to store email verification tokens."""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='email_verification_token'
    )
    token = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'accounts_email_verification_token'
        verbose_name = 'Email Verification Token'
        verbose_name_plural = 'Email Verification Tokens'
    
    def __str__(self):
        return f"Email verification token for {self.user.email}"
    
    @property
    def is_expired(self):
        """Check if token has expired."""
        return timezone.now() > self.expires_at


class PasswordResetToken(models.Model):
    """Model to store password reset tokens."""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens'
    )
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'accounts_password_reset_token'
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'
    
    def __str__(self):
        return f"Password reset token for {self.user.email}"
    
    @property
    def is_expired(self):
        """Check if token has expired."""
        return timezone.now() > self.expires_at
