from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Sum, Count, Q
from .models import ProgressTracker, TopicMastery, StudySession, SpacedRepetitionItem
from .serializers import ProgressTrackerSerializer, TopicMasterySerializer, StudySessionSerializer, SpacedRepetitionItemSerializer
from apps.quiz.models import QuizAttempt, AnswerAttempt
from apps.quiz.serializers import QuizAttemptSerializer
from .services.analytics_engine import AnalyticsEngine

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def progress(self, request):
        """
        Get overall user progress with complete statistics.
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
        Get an enhanced summary for the dashboard.
        """
        progress, _ = ProgressTracker.objects.get_or_create(user=request.user)
        
        # Weakest topics
        weak_qs = TopicMastery.objects.filter(user=request.user, mastery_score__lt=70).order_by('mastery_score')[:3]
        
        # Predicted Score
        prediction = AnalyticsEngine.calculate_predicted_score(request.user)
        
        # Study Patterns
        patterns = AnalyticsEngine.detect_optimal_study_time(request.user)
        
        return Response({
            "streak": progress.current_streak,
            "total_questions": progress.total_questions_attempted,
            "total_exams": progress.total_mock_exams_taken,
            "tutor_interactions": progress.tutor_interactions_count,
            "predicted_score": prediction,
            "study_patterns": {
                "optimal_study_time": patterns
            },
            "weak_topics": TopicMasterySerializer(weak_qs, many=True).data,
            "accuracy_percentage": progress.accuracy_percentage,
        })

    @action(detail=False, methods=['get'])
    def sessions(self, request):
        """
        Get individual study sessions for charts.
        """
        sessions = StudySession.objects.filter(user=request.user).order_by('-start_time')[:10]
        serializer = StudySessionSerializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        Get unified recent activities (quizzes and exams).
        """
        activities = AnalyticsEngine.get_recent_activities(request.user)
        return Response(activities)

    @action(detail=False, methods=['get'])
    def predicted_score(self, request):
        """
        Get predicted score and confidence.
        """
        data = AnalyticsEngine.calculate_predicted_score(request.user)
        return Response(data)

    @action(detail=False, methods=['get'])
    def study_patterns(self, request):
        """
        Get optimal study time and other patterns.
        """
        optimal_time = AnalyticsEngine.detect_optimal_study_time(request.user)
        return Response({
            "optimal_study_time": optimal_time,
        })

    @action(detail=False, methods=['get'])
    def spaced_repetition(self, request):
        """
        Get items due for review.
        """
        due_items = AnalyticsEngine.get_spaced_repetition_queue(request.user)
        serializer = SpacedRepetitionItemSerializer(due_items, many=True)
        return Response(serializer.data)
