from rest_framework import serializers
from .models import *

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'

class ExamBoardSerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)
    
    class Meta:
        model = ExamBoard
        fields = '__all__'

class ExamTypeSerializer(serializers.ModelSerializer):
    exam_board = ExamBoardSerializer(read_only=True)
    
    class Meta:
        model = ExamType
        fields = '__all__'

class SubtopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtopic
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    subtopics = SubtopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = Topic
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = Subject
        fields = '__all__'

# List serializers (without nested data for performance)
class SubjectListSerializer(serializers.ModelSerializer):
    topics_count = serializers.IntegerField(source='topics.count', read_only=True)
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'category', 'icon', 'color', 'is_core', 'topics_count']
