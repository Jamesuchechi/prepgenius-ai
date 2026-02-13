from django.db import models
from django.conf import settings
from apps.questions.models import Question
from apps.content.models import Subject, ExamType, Topic
from apps.study_tools.models import Document

class Quiz(models.Model):
    """
    Represents a generated quiz session. 
    A quiz is a collection of specific questions generated for a user.
    """
    DIFFICULTY_LEVELS = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    ]

    title = models.CharField(max_length=255)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True, blank=True)
    topic = models.CharField(max_length=255, help_text="Specific topic name") # Can be text or FK if Topic model is used strictly
    exam_type = models.ForeignKey(ExamType, on_delete=models.SET_NULL, null=True, blank=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='MEDIUM')
    
    # Source for RAG-based quizzes
    source_document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    questions = models.ManyToManyField(Question, related_name='quizzes')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.created_by.username})"

class QuizAttempt(models.Model):
    """
    Tracks a user's attempt at taking a quiz.
    """
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    
    score = models.FloatField(default=0.0)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - {self.status}"

class AnswerAttempt(models.Model):
    """
    Record of a single answer within a quiz attempt.
    """
    quiz_attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    
    selected_option = models.CharField(max_length=255, blank=True, null=True) # For MCQ (e.g., 'A', 'B' or value)
    text_response = models.TextField(blank=True, null=True) # For Theory
    
    is_correct = models.BooleanField(default=False)
    feedback = models.TextField(blank=True, help_text="AI generated feedback/explanation")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quiz_attempt} - Q{self.question.id}"
