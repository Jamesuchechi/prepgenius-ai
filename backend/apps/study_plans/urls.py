from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudyPlanViewSet, StudyTaskViewSet, StudyReminderViewSet

app_name = 'study_plans'

router = DefaultRouter()
router.register(r'study-plans', StudyPlanViewSet, basename='study-plan')
router.register(r'study-tasks', StudyTaskViewSet, basename='study-task')
router.register(r'reminders', StudyReminderViewSet, basename='reminder')

urlpatterns = [
    path('', include(router.urls)),
]
