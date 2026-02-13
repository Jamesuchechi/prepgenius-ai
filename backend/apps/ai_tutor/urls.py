"""URL configuration for AI tutor app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sessions', views.ChatSessionViewSet, basename='chat-session')

urlpatterns = [
    path('', include(router.urls)),
    path('transcribe/', views.TranscribeAudioView.as_view(), name='transcribe-audio'),
    path('suggested-questions/', views.SuggestedQuestionsView.as_view(), name='suggested-questions'),
]
