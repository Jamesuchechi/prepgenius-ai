from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.filter(is_active=True)
    serializer_class = CountrySerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'code']
    filterset_fields = ['region', 'is_active']

class ExamBoardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExamBoard.objects.filter(is_active=True)
    serializer_class = ExamBoardSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['country', 'is_international', 'is_active']
    search_fields = ['name', 'full_name']

class ExamTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExamType.objects.filter(is_active=True).select_related('exam_board__country')
    serializer_class = ExamTypeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['exam_board__country__code', 'level']
    search_fields = ['name', 'full_name']

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subject.objects.filter(is_active=True).prefetch_related('topics')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'is_core']
    search_fields = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SubjectListSerializer
        return SubjectSerializer

class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Topic.objects.filter(is_active=True).prefetch_related('subtopics')
    serializer_class = TopicSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['subject', 'difficulty']
    search_fields = ['name', 'description']

class SubtopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subtopic.objects.filter(is_active=True)
    serializer_class = SubtopicSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['topic']
    search_fields = ['name', 'content_summary']
