from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ProgressTracker, TopicMastery, StudySession
from .serializers import ProgressTrackerSerializer, TopicMasterySerializer, StudySessionSerializer
from django.utils import timezone
from django.shortcuts import get_object_or_404

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def overview(self, request):
        tracker, created = ProgressTracker.objects.get_or_create(user=request.user)
        # Ensure streak is up to date
        tracker.update_streak()
        serializer = ProgressTrackerSerializer(tracker)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='topic-mastery')
    def topic_mastery(self, request):
        masteries = TopicMastery.objects.filter(user=request.user).order_by('-mastery_percentage')
        serializer = TopicMasterySerializer(masteries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='weak-areas')
    def weak_areas(self, request):
        # Weak areas are topics with low mastery (< 50%) but at least some attempts (> 5)
        # or just sort by lowest mastery
        weak_areas = TopicMastery.objects.filter(
            user=request.user, 
            mastery_percentage__lt=60.0,
            total_attempts__gt=0
        ).order_by('mastery_percentage')[:5]
        
        serializer = TopicMasterySerializer(weak_areas, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'], url_path='performance-history')
    def performance_history(self, request):
        # For now, return study sessions as history
        # Ideally this would be aggregated daily performance
        sessions = StudySession.objects.filter(user=request.user).order_by('-start_time')[:10]
        serializer = StudySessionSerializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='study-sessions')
    def study_sessions(self, request):
        sessions = StudySession.objects.filter(user=request.user).order_by('-start_time')
        page = self.paginate_queryset(sessions) # ViewSet needs pagination mixin or manual
        # Simple list for now
        serializer = StudySessionSerializer(sessions[:20], many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='log-session')
    def log_session(self, request):
        serializer = StudySessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            
            # Update total study time
            tracker, _ = ProgressTracker.objects.get_or_create(user=request.user)
            tracker.total_study_time_seconds += serializer.validated_data.get('duration_seconds', 0)
            tracker.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
