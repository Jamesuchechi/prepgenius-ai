
from django.contrib import admin
from .models import MockExam, MockExamQuestion, ExamAttempt, ExamResult

class MockExamQuestionInline(admin.TabularInline):
	model = MockExamQuestion
	extra = 0

@admin.register(MockExam)
class MockExamAdmin(admin.ModelAdmin):
	list_display = ("title", "exam_type", "subject", "creator", "duration_minutes", "created_at")
	inlines = [MockExamQuestionInline]

@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
	list_display = ("user", "mock_exam", "started_at", "completed_at", "is_submitted", "score")
	search_fields = ("user__username", "mock_exam__title")

@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
	list_display = ("attempt", "total_score", "percentage", "passed", "generated_at")
	search_fields = ("attempt__user__username", "attempt__mock_exam__title")
