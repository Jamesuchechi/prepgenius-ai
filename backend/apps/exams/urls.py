
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for viewsets
router = DefaultRouter()
router.register(r'', views.MockExamViewSet, basename='mockexam')

urlpatterns = [
	# Exam management (ViewSet routes)
	path('', include(router.urls)),
	
	# Exam operations - start, submit, result
	path('<int:exam_id>/start/', views.ExamStartView.as_view(), name='exam-start'),
	path('<int:exam_id>/submit/', views.ExamSubmitView.as_view(), name='exam-submit'),
	path('<int:exam_id>/result/', views.ExamResultView.as_view(), name='exam-result'),
	
	# User's attempts
	path('my-attempts/', views.MyExamAttemptsView.as_view(), name='my-exam-attempts'),
	path('attempts/<int:attempt_id>/', views.ExamAttemptDetailView.as_view(), name='exam-attempt-detail'),
	
	# Legacy endpoints (for backward compatibility)
	path('create/', views.MockExamCreateView.as_view(), name='mockexam-create'),
	
	# Stats
	path('stats/user-summary/', views.UserExamStatsView.as_view(), name='user-exam-stats'),
	
	# Explanations
	path('explain/<int:question_id>/', views.ExplainQuestionView.as_view(), name='explain-question'),
]
