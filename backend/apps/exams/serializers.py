
from rest_framework import serializers
from .models import MockExam, ExamAttempt, ExamResult
from apps.questions.models import Question, Answer
from apps.content.models import Topic

class AnswerSerializer(serializers.ModelSerializer):
	class Meta:
		model = Answer
		fields = ["id", "content", "is_correct", "explanation"]

class QuestionDetailSerializer(serializers.ModelSerializer):
	answers = AnswerSerializer(many=True, read_only=True)
	topic_name = serializers.CharField(source='topic.name', read_only=True)
	
	class Meta:
		model = Question
		fields = [
			"id", "content", "question_type", "difficulty", 
			"answers", "topic_name", "guidance"
		]

class QuestionShortSerializer(serializers.ModelSerializer):
	answers_count = serializers.SerializerMethodField()
	topic_name = serializers.CharField(source='topic.name', read_only=True)
	
	class Meta:
		model = Question
		fields = [
			"id", "content", "question_type", "difficulty",
			"answers_count", "topic_name"
		]
	
	def get_answers_count(self, obj):
		return obj.answers.count()

class MockExamSerializer(serializers.ModelSerializer):
	question_count = serializers.SerializerMethodField()
	attempt_count = serializers.SerializerMethodField()
	average_score = serializers.SerializerMethodField()
	created_by = serializers.CharField(source='creator.get_full_name', read_only=True)
	
	class Meta:
		model = MockExam
		fields = [
			"id", "title", "description", "exam_type", "subject",
			"created_by", "duration_minutes", "total_marks",
			"passing_score", "is_active", "is_public",
			"question_count", "attempt_count", "average_score",
			"created_at", "updated_at"
		]
		read_only_fields = ["created_at", "updated_at"]
	
	def get_question_count(self, obj):
		return obj.get_question_count()
	
	def get_attempt_count(self, obj):
		return obj.get_attempt_count()
	
	def get_average_score(self, obj):
		return obj.get_average_score()

class MockExamDetailSerializer(MockExamSerializer):
	questions = QuestionDetailSerializer(many=True, read_only=True)
	exam_type_name = serializers.CharField(source='exam_type.name', read_only=True)
	subject_name = serializers.CharField(source='subject.name', read_only=True)
	
	class Meta(MockExamSerializer.Meta):
		fields = MockExamSerializer.Meta.fields + [
			"questions", "exam_type_name", "subject_name"
		]

class ExamAttemptSerializer(serializers.ModelSerializer):
	mock_exam = MockExamSerializer(read_only=True)
	mock_exam_id = serializers.IntegerField(write_only=True, required=False)
	remaining_time_seconds = serializers.SerializerMethodField()
	is_time_expired = serializers.SerializerMethodField()
	user_name = serializers.CharField(source='user.get_full_name', read_only=True)
	
	class Meta:
		model = ExamAttempt
		fields = [
			"id", "user_name", "mock_exam", "mock_exam_id", "started_at",
			"completed_at", "time_taken_seconds", "is_submitted", "status",
			"score", "percentage", "raw_responses", "auto_graded",
			"attempted_questions", "remaining_time_seconds",
			"is_time_expired", "ip_address", "user_agent"
		]
		read_only_fields = [
			"user_name", "started_at", "completed_at", "score",
			"percentage", "auto_graded", "attempted_questions",
			"status", "ip_address", "user_agent"
		]
	
	def get_remaining_time_seconds(self, obj):
		return obj.get_remaining_time_seconds()
	
	def get_is_time_expired(self, obj):
		return obj.is_time_expired()

class ExamResultDetailedBreakdownSerializer(serializers.Serializer):
	"""Serializer for detailed exam breakdown."""
	pass

class ExamResultSerializer(serializers.ModelSerializer):
	attempt = ExamAttemptSerializer(read_only=True)
	grade = serializers.SerializerMethodField()
	percentage_display = serializers.SerializerMethodField()
	
	class Meta:
		model = ExamResult
		fields = [
			"id", "attempt", "total_score", "percentage",
			"percentage_display", "grade", "passed",
			"correct_answers", "incorrect_answers", "unanswered",
			"detailed_breakdown", "performance_summary",
			"recommendations", "generated_at", "updated_at"
		]
		read_only_fields = [
			"total_score", "percentage", "passed",
			"correct_answers", "incorrect_answers", "unanswered",
			"detailed_breakdown", "performance_summary",
			"recommendations", "generated_at", "updated_at"
		]
	
	def get_grade(self, obj):
		return obj.get_grade()
	
	def get_percentage_display(self, obj):
		return f"{obj.percentage:.1f}%"

class ExamSubmissionSerializer(serializers.Serializer):
	"""Serializer for exam submission."""
	raw_responses = serializers.JSONField(
		help_text="Dict mapping question IDs to answer IDs"
	)
	time_taken_seconds = serializers.IntegerField(
		help_text="Total time taken in seconds"
	)
	
	def validate_raw_responses(self, value):
		if not isinstance(value, dict):
			raise serializers.ValidationError("raw_responses must be a dictionary")
		return value
	
	def validate_time_taken_seconds(self, value):
		if value < 0:
			raise serializers.ValidationError("time_taken_seconds cannot be negative")
		return value
