from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, FlashcardViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'flashcards', FlashcardViewSet, basename='flashcard')

urlpatterns = [
    path('', include(router.urls)),
]
