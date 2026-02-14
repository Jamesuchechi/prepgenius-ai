from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstitutionViewSet, StudentManagementViewSet

app_name = 'institutions'

router = DefaultRouter()
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'students', StudentManagementViewSet, basename='student-management')

urlpatterns = [
    path('', include(router.urls)),
]
