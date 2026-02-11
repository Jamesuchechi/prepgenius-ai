from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import timedelta
from apps.content.models import Topic, Subject, ExamType


class StudyPlan(models.Model):
    """
    Represents a personalized study plan for a user.
    Generated using AI based on user profile, exam date, and learning pace.
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    PLAN_TYPE_CHOICES = [
        ('ai_generated', 'AI Generated'),
        ('custom', 'Custom'),
        ('template', 'Template-based'),
    ]
    
    # Relationships
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_plans')
    exam_type = models.ForeignKey(ExamType, on_delete=models.SET_NULL, null=True, blank=True)
    subjects = models.ManyToManyField(Subject, related_name='study_plans')
    
    # Plan Details
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES, default='ai_generated')
    
    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    exam_date = models.DateField(help_text="Target exam date")
    start_date = models.DateField(default=timezone.now)
    estimated_completion_date = models.DateField(null=True, blank=True)
    actual_completion_date = models.DateField(null=True, blank=True)
    
    # Status & Metrics
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    total_topics = models.IntegerField(default=0)
    completed_topics = models.IntegerField(default=0)
    total_estimated_study_hours = models.FloatField(default=0.0, validators=[MinValueValidator(0)])
    actual_study_hours = models.FloatField(default=0.0, validators=[MinValueValidator(0)])
    
    # Configuration
    study_hours_per_day = models.FloatField(
        default=2.5,
        validators=[MinValueValidator(0.5), MaxValueValidator(12)],
        help_text="Target hours for daily study"
    )
    study_days_per_week = models.IntegerField(
        default=6,
        validators=[MinValueValidator(1), MaxValueValidator(7)],
        help_text="Days available for study per week"
    )
    difficulty_preference = models.CharField(
        max_length=20,
        choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')],
        default='intermediate'
    )
    include_weekends = models.BooleanField(default=True)
    
    # AI Generation Metadata
    ai_prompt_used = models.TextField(blank=True, help_text="The prompt used to generate this plan")
    ai_provider = models.CharField(max_length=50, blank=True, help_text="Which AI service generated this plan")
    confidence_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text="AI confidence in the generated plan"
    )
    
    # Performance Tracking
    average_daily_progress = models.FloatField(default=0.0, help_text="Percentage of plan completed")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['exam_date']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.user.get_full_name()}"
    
    def days_until_exam(self):
        """Calculate days remaining until exam."""
        return (self.exam_date - timezone.now().date()).days
    
    def is_on_track(self):
        """Check if plan is on track based on current progress."""
        if self.estimated_completion_date:
            days_remaining = (self.estimated_completion_date - timezone.now().date()).days
            expected_completion = (self.total_topics / self.total_topics) * 100 if self.total_topics else 0
            actual_completion = (self.completed_topics / self.total_topics) * 100 if self.total_topics else 0
            
            if days_remaining > 0:
                expected_daily_progress = expected_completion / days_remaining
                actual_daily_progress = actual_completion / max(1, (timezone.now().date() - self.start_date).days)
                return actual_daily_progress >= expected_daily_progress * 0.8  # Allow 20% buffer
        return True
    
    def get_completion_percentage(self):
        """Get overall plan completion percentage."""
        if self.total_topics == 0:
            return 0.0
        return (self.completed_topics / self.total_topics) * 100
    
    def update_progress(self):
        """Update progress metrics."""
        from .models import StudyTask
        tasks = StudyTask.objects.filter(study_plan=self)
        total = tasks.count()
        completed = tasks.filter(status='completed').count()
        
        self.total_topics = total
        self.completed_topics = completed
        self.average_daily_progress = self.get_completion_percentage()
        self.save()


class StudyTask(models.Model):
    """
    Individual study task/topic within a study plan.
    Represents a specific subject topic to study on a particular date.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
        ('revisit', 'Revisit Required'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    # Relationships
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='tasks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    
    # Scheduling
    scheduled_start_date = models.DateField()
    scheduled_end_date = models.DateField()
    scheduled_start_time = models.TimeField(null=True, blank=True)
    scheduled_end_time = models.TimeField(null=True, blank=True)
    
    # Actual Progress
    actual_start_date = models.DateField(null=True, blank=True)
    actual_completion_date = models.DateField(null=True, blank=True)
    actual_time_spent_seconds = models.IntegerField(default=0)
    
    # Task Details
    estimated_duration_hours = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.25)],
        help_text="Estimated hours to complete this task"
    )
    description = models.TextField(blank=True)
    learning_objectives = models.JSONField(
        default=list,
        help_text="List of learning objectives for this task"
    )
    
    # Status & Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    difficulty_level = models.CharField(
        max_length=20,
        choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')],
        default='intermediate'
    )
    
    # Performance Metrics
    completion_percentage = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Percentage of task completed"
    )
    understanding_level = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="User's understanding of the topic (0-100)"
    )
    
    # Additional Features
    is_repeatable = models.BooleanField(default=False, help_text="Task can be repeated for reinforcement")
    repeat_count = models.IntegerField(default=0)
    max_repeats = models.IntegerField(default=3)
    
    # Reminders
    reminder_sent = models.BooleanField(default=False)
    reminder_date = models.DateField(null=True, blank=True)
    reminder_time = models.TimeField(null=True, blank=True)
    
    # Notes & Resources
    notes = models.TextField(blank=True)
    resource_links = models.JSONField(
        default=list,
        help_text="Links to study materials"
    )
    question_ids = models.JSONField(
        default=list,
        help_text="IDs of questions related to this task"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['scheduled_start_date', 'priority']
        indexes = [
            models.Index(fields=['study_plan', 'scheduled_start_date']),
            models.Index(fields=['study_plan', 'status']),
            models.Index(fields=['topic', 'scheduled_start_date']),
        ]
        unique_together = [('study_plan', 'topic', 'scheduled_start_date')]
    
    def __str__(self):
        return f"{self.topic.name} - {self.scheduled_start_date} ({self.status})"
    
    def is_overdue(self):
        """Check if task is overdue."""
        return (
            self.status in ['pending', 'in_progress'] and
            timezone.now().date() > self.scheduled_end_date
        )
    
    def get_time_remaining_hours(self):
        """Calculate hours remaining to complete this task."""
        if self.actual_start_date:
            time_spent_hours = self.actual_time_spent_seconds / 3600
            remaining = self.estimated_duration_hours - time_spent_hours
            return max(0, remaining)
        return self.estimated_duration_hours
    
    def get_days_until_deadline(self):
        """Get days remaining until scheduled end date."""
        return (self.scheduled_end_date - timezone.now().date()).days
    
    def mark_completed(self, understanding_level=0, notes=''):
        """Mark task as completed."""
        self.status = 'completed'
        self.actual_completion_date = timezone.now().date()
        self.completion_percentage = 100.0
        if understanding_level:
            self.understanding_level = understanding_level
        if notes:
            self.notes = notes
        self.save()
        
        # Update parent study plan
        self.study_plan.update_progress()
    
    def mark_in_progress(self):
        """Mark task as in progress."""
        if not self.actual_start_date:
            self.actual_start_date = timezone.now().date()
        self.status = 'in_progress'
        self.save()
    
    def add_study_session(self, duration_seconds, understanding_level=None):
        """Record a study session for this task."""
        self.actual_time_spent_seconds += duration_seconds
        if understanding_level is not None:
            # Update understanding level (averaging)
            self.understanding_level = int(
                (self.understanding_level + understanding_level) / 2
            )
        self.save()


class StudyReminder(models.Model):
    """
    Manages reminders for study tasks.
    """
    
    REMINDER_TYPE_CHOICES = [
        ('task_start', 'Task Start Reminder'),
        ('task_deadline', 'Task Deadline Reminder'),
        ('weak_topic', 'Weak Topic Review'),
        ('daily_goal', 'Daily Goal Reminder'),
    ]
    
    FREQUENCY_CHOICES = [
        ('once', 'One Time'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    ]
    
    study_task = models.ForeignKey(StudyTask, on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='reminders', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_reminders')
    
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPE_CHOICES)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='once')
    
    scheduled_datetime = models.DateTimeField()
    last_sent = models.DateTimeField(null=True, blank=True)
    next_send = models.DateTimeField(null=True, blank=True)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['scheduled_datetime']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['scheduled_datetime']),
        ]
    
    def __str__(self):
        return f"{self.get_reminder_type_display()} - {self.user.get_full_name()}"
    
    def should_send(self):
        """Check if reminder should be sent now."""
        return (
            self.is_active and
            timezone.now() >= self.scheduled_datetime and
            (self.last_sent is None or self._should_resend())
        )
    
    def _should_resend(self):
        """Check if reminder should be resent based on frequency."""
        if self.frequency == 'once':
            return False
        
        if self.last_sent is None:
            return True
        
        if self.frequency == 'daily':
            return timezone.now() - self.last_sent >= timedelta(days=1)
        elif self.frequency == 'weekly':
            return timezone.now() - self.last_sent >= timedelta(weeks=1)
        
        return False
    
    def mark_sent(self):
        """Mark reminder as sent."""
        self.last_sent = timezone.now()
        self.save()


class AdjustmentHistory(models.Model):
    """
    Track adjustments made to study plans based on user performance.
    """
    
    ADJUSTMENT_TYPE_CHOICES = [
        ('difficulty_increase', 'Difficulty Increased'),
        ('difficulty_decrease', 'Difficulty Decreased'),
        ('pace_adjustment', 'Study Pace Adjusted'),
        ('topic_added', 'Topic Added'),
        ('topic_removed', 'Topic Removed'),
        ('deadline_extended', 'Deadline Extended'),
        ('priority_updated', 'Priority Updated'),
    ]
    
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='adjustments')
    adjustment_type = models.CharField(max_length=30, choices=ADJUSTMENT_TYPE_CHOICES)
    reason = models.TextField()
    
    # What changed
    task = models.ForeignKey(StudyTask, on_delete=models.SET_NULL, null=True, blank=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    
    # Performance trigger
    performance_metric = models.CharField(
        max_length=50,
        blank=True,
        help_text="Metric that triggered adjustment (e.g., 'accuracy_score')"
    )
    performance_threshold = models.FloatField(null=True, blank=True)
    actual_performance = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['study_plan', 'adjustment_type']),
        ]
    
    def __str__(self):
        return f"{self.study_plan.name} - {self.get_adjustment_type_display()}"
