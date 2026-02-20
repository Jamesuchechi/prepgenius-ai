from django.db import models
from apps.content.models import Subject, Topic, ExamType
from django.conf import settings

class Question(models.Model):
    QUESTION_TYPES = [
        ('MCQ', 'Multiple Choice'),
        ('THEORY', 'Theory/Essay'),
        ('TRUE_FALSE', 'True/False'),
        ('FILL_BLANK', 'Fill in the Blanks'),
        ('MATCHING', 'Matching'),
        ('ORDERING', 'Ordering'),
    ]
    
    DIFFICULTY_LEVELS = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    ]

    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True)
    exam_type = models.ForeignKey(ExamType, on_delete=models.SET_NULL, null=True, blank=True)
    
    content = models.TextField(help_text="The question text")
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='MCQ', db_index=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='MEDIUM', db_index=True)
    
    guidance = models.TextField(blank=True, help_text="AI guidance/hint for solving")
    metadata = models.JSONField(default=dict, blank=True, help_text="Extra data like ordering sequence or matching pairs")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subject.name} - {self.difficulty} - {self.question_type}"

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField()
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True, help_text="Extra data for complex answer types")
    
    def __str__(self):
        return f"{self.content[:50]} ({'Correct' if self.is_correct else 'Wrong'})"

class QuestionAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(Answer, on_delete=models.SET_NULL, null=True, blank=True) # For single choice
    response_data = models.JSONField(default=dict, blank=True, help_text="User response for complex types")
    is_correct = models.BooleanField()
    score = models.FloatField(default=0.0, help_text="Score for partial correctness")
    time_taken_seconds = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'question']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.question}"
