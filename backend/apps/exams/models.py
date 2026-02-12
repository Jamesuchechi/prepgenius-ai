
from django.db import models
from django.conf import settings
from apps.content.models import Subject, ExamType
from apps.questions.models import Question
from django.utils import timezone

class MockExam(models.Model):
	"""
	Represents a generated mock exam (e.g., JAMB format).
	"""
	title = models.CharField(max_length=255)
	description = models.TextField(blank=True, help_text="Exam description and instructions")
	exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE)
	subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
	creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
	questions = models.ManyToManyField(Question, through='MockExamQuestion')
	duration_minutes = models.PositiveIntegerField(default=60)
	total_marks = models.PositiveIntegerField(default=100)
	passing_score = models.PositiveIntegerField(default=40, help_text="Percentage required to pass")
	is_active = models.BooleanField(default=True)
	is_public = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['exam_type', 'subject']),
			models.Index(fields=['is_active', 'is_public']),
		]

	def __str__(self):
		return f"{self.title} ({self.exam_type.name})"
	
	def get_question_count(self):
		return self.mockexamquestion_set.count()
	
	def get_attempt_count(self):
		return self.examinattempt_set.count()
	
	def get_average_score(self):
		from django.db.models import Avg
		avg = self.examinattempt_set.filter(
			is_submitted=True,
			auto_graded=True
		).aggregate(avg_score=Avg('score'))['avg_score']
		return avg or 0

class MockExamQuestion(models.Model):
	mock_exam = models.ForeignKey(MockExam, on_delete=models.CASCADE)
	question = models.ForeignKey(Question, on_delete=models.CASCADE)
	order = models.PositiveIntegerField(default=0)

	class Meta:
		unique_together = ('mock_exam', 'question')
		ordering = ['order']

class ExamAttempt(models.Model):
	"""
	Represents a user's attempt at a mock exam.
	"""
	STATUS_CHOICES = [
		('IN_PROGRESS', 'In Progress'),
		('SUBMITTED', 'Submitted'),
		('GRADED', 'Graded'),
		('TIME_UP', 'Time Up'),
	]
	
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exam_attempts')
	mock_exam = models.ForeignKey(MockExam, on_delete=models.CASCADE, related_name='examinattempt_set')
	started_at = models.DateTimeField(auto_now_add=True)
	completed_at = models.DateTimeField(null=True, blank=True)
	time_taken_seconds = models.PositiveIntegerField(default=0)
	is_submitted = models.BooleanField(default=False)
	status = models.CharField(
		max_length=20,
		choices=STATUS_CHOICES,
		default='IN_PROGRESS'
	)
	score = models.FloatField(default=0.0)
	percentage = models.FloatField(default=0.0)
	raw_responses = models.JSONField(default=dict, blank=True, help_text="User answers by question id")
	auto_graded = models.BooleanField(default=False)
	attempted_questions = models.PositiveIntegerField(default=0, help_text="Count of answered questions")
	ip_address = models.GenericIPAddressField(null=True, blank=True)
	user_agent = models.TextField(blank=True)

	class Meta:
		# Allow multiple attempts per user per mock exam (removing unique constraint)
		ordering = ['-started_at']
		indexes = [
			models.Index(fields=['user', 'mock_exam']),
			models.Index(fields=['user', 'started_at']),
			models.Index(fields=['status']),
		]

	def __str__(self):
		return f"{self.user} - {self.mock_exam} ({self.status})"
	
	def is_time_expired(self):
		"""Check if the exam time has expired."""
		allowed_seconds = self.mock_exam.duration_minutes * 60
		return self.time_taken_seconds >= allowed_seconds
	
	def get_remaining_time_seconds(self):
		"""Get remaining time in seconds."""
		allowed_seconds = self.mock_exam.duration_minutes * 60
		remaining = allowed_seconds - self.time_taken_seconds
		return max(0, remaining)
	
	def mark_submitted(self):
		"""Mark the attempt as submitted."""
		self.is_submitted = True
		self.status = 'SUBMITTED'
		self.completed_at = timezone.now()
		self.save()

class ExamResult(models.Model):
	"""
	Stores the result and analytics for a completed exam attempt.
	"""
	attempt = models.OneToOneField(ExamAttempt, on_delete=models.CASCADE, related_name='result')
	total_score = models.FloatField()
	percentage = models.FloatField()
	passed = models.BooleanField(default=False)
	correct_answers = models.PositiveIntegerField(default=0)
	incorrect_answers = models.PositiveIntegerField(default=0)
	unanswered = models.PositiveIntegerField(default=0)
	detailed_breakdown = models.JSONField(default=dict, blank=True, help_text="Per-question and per-topic analysis")
	performance_summary = models.JSONField(default=dict, blank=True, help_text="Summary of performance by topic")
	recommendations = models.JSONField(default=list, blank=True, help_text="AI-generated recommendations")
	generated_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-generated_at']

	def __str__(self):
		return f"Result for {self.attempt} - {self.percentage}%"
	
	def get_grade(self):
		"""Get letter grade based on percentage."""
		if self.percentage >= 90:
			return 'A'
		elif self.percentage >= 80:
			return 'B'
		elif self.percentage >= 70:
			return 'C'
		elif self.percentage >= 60:
			return 'D'
		else:
			return 'F'
