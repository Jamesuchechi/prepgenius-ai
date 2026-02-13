from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ProgressTracker, TopicMastery
from .serializers import ProgressTrackerSerializer, TopicMasterySerializer
from apps.quiz.models import QuizAttempt
from apps.quiz.serializers import QuizAttemptSerializer

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def progress(self, request):
        """
        Get overall user progress.
        """
        progress, _ = ProgressTracker.objects.get_or_create(user=request.user)
        serializer = ProgressTrackerSerializer(progress)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def mastery(self, request):
        """
        Get topic mastery scores.
        """
        mastery_qs = TopicMastery.objects.filter(user=request.user).order_by('-mastery_score')
        serializer = TopicMasterySerializer(mastery_qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get a summary for the dashboard (streak + top weak/strong topics).
        """
        progress, _ = ProgressTracker.objects.get_or_create(user=request.user)
        
        # Weakest topics (bottom 3 less than 70%)
        weak_qs = TopicMastery.objects.filter(user=request.user, mastery_score__lt=70).order_by('mastery_score')[:3]
        
        # Strongest topics (top 3 above 70%)
        strong_qs = TopicMastery.objects.filter(user=request.user, mastery_score__gte=70).order_by('-mastery_score')[:3]
        
        return Response({
            "streak": progress.current_streak,
            "total_questions": progress.total_quizzes_taken,
            "weak_topics": TopicMasterySerializer(weak_qs, many=True).data,
            "strong_topics": TopicMasterySerializer(strong_qs, many=True).data,
        })

    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        Get recent quiz attempts history.
        """
        attempts = QuizAttempt.objects.filter(user=request.user).order_by('-completed_at')[:10]
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)
