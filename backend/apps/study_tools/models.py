from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.content.models import Subject, Topic
import uuid
import os

User = get_user_model()

def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/documents/<filename>
    return f'user_{instance.user.id}/documents/{filename}'

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=user_directory_path)
    file_type = models.CharField(max_length=10, choices=[
        ('pdf', 'PDF'),
        ('txt', 'Text'),
        ('md', 'Markdown')
    ])
    processed = models.BooleanField(default=False)
    processing_status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ])
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    def save(self, *args, **kwargs):
        # Auto-detect file type from extension
        if not self.file_type and self.file:
            ext = os.path.splitext(self.file.name)[1].lower()
            if ext == '.pdf':
                self.file_type = 'pdf'
            elif ext == '.txt':
                self.file_type = 'txt'
            elif ext == '.md':
                self.file_type = 'md'
        super().save(*args, **kwargs)

    # Content storage for RAG (stored in DB for simplicity in MVP)
    content = models.TextField(blank=True, null=True, help_text="Full extracted text content")


class DocumentChunk(models.Model):
    """
    Stores chunks of text and their vector embeddings for RAG.
    """
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.IntegerField()
    content = models.TextField()
    embedding = models.JSONField(help_text="Vector embedding as a list of floats")
    
    class Meta:
        ordering = ['chunk_index']
        indexes = [
            models.Index(fields=['document', 'chunk_index']),
        ]

    def __str__(self):
        return f"{self.document.title} - Chunk {self.chunk_index}"

class Flashcard(models.Model):
    """
    Stores flashcards for Spaced Repetition System (SRS).
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcards')
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True)
    
    front = models.TextField(help_text="The question or prompt")
    back = models.TextField(help_text="The answer or explanation")
    
    # SRS Metadata (SM-2 Algorithm)
    ease_factor = models.FloatField(default=2.5)
    interval = models.IntegerField(default=0, help_text="Interval in days")
    repetitions = models.IntegerField(default=0)
    next_review = models.DateField(default=timezone.now)
    
    # Source tracking
    source_type = models.CharField(max_length=50, choices=[
        ('manual', 'Manual'),
        ('ai_generated', 'AI Generated'),
        ('exam_mistake', 'Exam Mistake')
    ], default='manual')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['next_review', '-created_at']
        indexes = [
            models.Index(fields=['user', 'next_review']),
            models.Index(fields=['subject', 'topic']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.front[:50]}"

class FlashcardReviewLog(models.Model):
    """
    Tracks review history for a flashcard.
    """
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='review_logs')
    rating = models.IntegerField(help_text="0: Again, 1: Hard, 2: Good, 3: Easy")
    reviewed_at = models.DateTimeField(auto_now_add=True)
    
    # Snapshot of SRS state before this review
    old_interval = models.IntegerField()
    old_ease_factor = models.FloatField()
    
    # Snapshot after review
    new_interval = models.IntegerField()
    new_ease_factor = models.FloatField()

    def __str__(self):
        return f"Review for {self.flashcard.id} at {self.reviewed_at}"
