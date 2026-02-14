from django.db import models
from django.conf import settings
import uuid

class Institution(models.Model):
    """Model representing an educational institution (school)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, unique=True, help_text="Unique code for students to join")
    admin = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='managed_institution',
        help_text="The user who manages this institution"
    )
    address = models.TextField(blank=True)
    contact_email = models.EmailField()
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='institution_logos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class StudentLink(models.Model):
    """Link between a student and an institution."""
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
    )
    
    institution = models.ForeignKey(
        Institution, 
        on_delete=models.CASCADE, 
        related_name='students'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='institution_links'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('institution', 'student')

    def __str__(self):
        return f"{self.student} -> {self.institution} ({self.status})"
