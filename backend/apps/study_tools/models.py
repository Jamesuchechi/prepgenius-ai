from django.db import models
from django.contrib.auth import get_user_model
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
