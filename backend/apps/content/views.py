from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import *
from .serializers import *
from .services.topic_generator import TopicGenerationService
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

@method_decorator(cache_page(60 * 60 * 2), name='dispatch')

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.filter(is_active=True)
    serializer_class = CountrySerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'code']
    filterset_fields = ['region', 'is_active']

@method_decorator(cache_page(60 * 60 * 2), name='dispatch')
class ExamBoardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExamBoard.objects.filter(is_active=True)
    serializer_class = ExamBoardSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['country', 'is_international', 'is_active']
    search_fields = ['name', 'full_name']

@method_decorator(cache_page(60 * 60 * 2), name='dispatch')
class ExamTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExamType.objects.filter(is_active=True).select_related('exam_board__country')
    serializer_class = ExamTypeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['exam_board__country__code', 'level']
    search_fields = ['name', 'full_name']

@method_decorator(cache_page(60 * 60 * 2), name='dispatch')
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

    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = GenerateTopicSerializer(data=request.data)
        if serializer.is_valid():
            subject_name = serializer.validated_data['subject']
            service = TopicGenerationService()
            try:
                topics = service.get_or_generate_topics(subject_name)
                output_serializer = TopicSerializer(topics, many=True)
                return Response(output_serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubtopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subtopic.objects.filter(is_active=True)
    serializer_class = SubtopicSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['topic']
    search_fields = ['name', 'content_summary']
