import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class ChatSession(models.Model):
    """Represents a chat session between a user and the AI tutor."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_sessions'
    )
    subject = models.CharField(max_length=100, blank=True, null=True)
    exam_type = models.CharField(max_length=50, blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Response style preferences
    tone = models.CharField(
        max_length=20,
        choices=[('formal', 'Formal'), ('casual', 'Casual')],
        default='casual',
        help_text="Teaching tone: formal or casual"
    )
    detail_level = models.CharField(
        max_length=20,
        choices=[('concise', 'Concise'), ('detailed', 'Detailed')],
        default='detailed',
        help_text="Response detail level"
    )
    use_analogies = models.BooleanField(
        default=True,
        help_text="Use analogies and real-world examples"
    )
    socratic_mode = models.BooleanField(
        default=False,
        help_text="Ask guiding questions instead of direct answers"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"Chat Session {self.id} - {self.user.email}"
    
    def get_message_count(self):
        """Get the total number of messages in this session."""
        return self.messages.count()
    
    def get_last_message(self):
        """Get the last message in this session."""
        return self.messages.order_by('-timestamp').first()


class ChatMessage(models.Model):
    """Represents a single message in a chat session."""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    image = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class ChatRateLimit(models.Model):
    """Tracks rate limiting for chat messages per user."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_rate_limits'
    )
    message_count = models.IntegerField(default=0)
    window_start = models.DateTimeField(default=timezone.now)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', 'window_start']),
        ]
    
    def __str__(self):
        return f"Rate limit for {self.user.email}: {self.message_count} messages"
    
    def reset_if_needed(self):
        """Reset the counter if the time window has passed (1 hour)."""
        now = timezone.now()
        if (now - self.window_start).total_seconds() > 3600:  # 1 hour
            self.message_count = 0
            self.window_start = now
            self.save()
    
    def increment(self):
        """Increment the message count."""
        self.reset_if_needed()
        self.message_count += 1
        self.save()
    
    def is_rate_limited(self, limit=50):
        """Check if the user has exceeded the rate limit."""
        self.reset_if_needed()
        return self.message_count >= limit
