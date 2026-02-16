from rest_framework import serializers
from django.utils import timezone
from .models import StudyPlan, StudyTask, StudyReminder, AdjustmentHistory, StudyPlanAssessment
from .serializers_base import (
    StudyPlanAssessmentSerializer
)
from apps.content.models import Subject, Topic, ExamType
from apps.questions.serializers import QuestionSerializer
from apps.ai_tutor.serializers import ChatSessionSerializer


class StudyTaskSerializer(serializers.ModelSerializer):
    """Serializer for individual study tasks."""
    
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    days_until_deadline = serializers.SerializerMethodField()
    time_remaining_hours = serializers.SerializerMethodField()
    actual_time_spent_hours = serializers.SerializerMethodField()
    
    questions = QuestionSerializer(many=True, read_only=True)
    chat_session = ChatSessionSerializer(read_only=True)
    
    class Meta:
        model = StudyTask
        fields = [
            'id',
            'study_plan',
            'subject',
            'subject_name',
            'topic',
            'topic_name',
            'scheduled_start_date',
            'scheduled_end_date',
            'scheduled_start_time',
            'scheduled_end_time',
            'actual_start_date',
            'actual_completion_date',
            'estimated_duration_hours',
            'actual_time_spent_hours',
            'description',
            'learning_objectives',
            'status',
            'priority',
            'difficulty_level',
            'completion_percentage',
            'understanding_level',
            'is_repeatable',
            'repeat_count',
            'max_repeats',
            'reminder_sent',
            'reminder_date',
            'reminder_time',
            'notes',
            'resource_links',
            'question_ids',
            'questions',      # New field
            'chat_session',   # New field
            'is_overdue',
            'days_until_deadline',
            'time_remaining_hours',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'actual_start_date',
            'actual_completion_date',
            'questions',
            'chat_session'
        ]
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()
    
    def get_days_until_deadline(self, obj):
        return obj.get_days_until_deadline()
    
    def get_time_remaining_hours(self, obj):
        return obj.get_time_remaining_hours()
    
    def get_actual_time_spent_hours(self, obj):
        return obj.actual_time_spent_seconds / 3600


class StudyReminderSerializer(serializers.ModelSerializer):
    """Serializer for study reminders."""
    
    should_send = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyReminder
        fields = [
            'id',
            'study_task',
            'study_plan',
            'user',
            'reminder_type',
            'frequency',
            'scheduled_datetime',
            'last_sent',
            'next_send',
            'title',
            'message',
            'is_active',
            'should_send',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'user',
            'created_at',
            'last_sent'
        ]
    
    def get_should_send(self, obj):
        return obj.should_send()


class AdjustmentHistorySerializer(serializers.ModelSerializer):
    """Serializer for adjustment history."""
    
    task_name = serializers.CharField(source='task.topic.name', read_only=True, allow_null=True)
    
    class Meta:
        model = AdjustmentHistory
        fields = [
            'id',
            'study_plan',
            'adjustment_type',
            'reason',
            'task',
            'task_name',
            'old_value',
            'new_value',
            'performance_metric',
            'performance_threshold',
            'actual_performance',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'created_at'
        ]


class StudyPlanDetailedSerializer(serializers.ModelSerializer):
    """Detailed serializer for study plans with nested tasks and reminders."""
    
    tasks = StudyTaskSerializer(source='tasks.all', many=True, read_only=True)
    reminders = StudyReminderSerializer(source='reminders.all', many=True, read_only=True)
    adjustments = AdjustmentHistorySerializer(source='adjustments.all', many=True, read_only=True)
    
    exam_type_name = serializers.CharField(source='exam_type.name', read_only=True, allow_null=True)
    subjects_list = serializers.SerializerMethodField()
    
    days_until_exam = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    is_on_track = serializers.SerializerMethodField()
    is_mock_period = serializers.SerializerMethodField()
    can_complete = serializers.SerializerMethodField()
    assessments = StudyPlanAssessmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudyPlan
        fields = [
            'id',
            'user',
            'exam_type',
            'exam_type_name',
            'subjects_list',
            'name',
            'description',
            'plan_type',
            'created_at',
            'updated_at',
            'exam_date',
            'start_date',
            'estimated_completion_date',
            'actual_completion_date',
            'status',
            'is_favourite',
            'total_topics',
            'completed_topics',
            'total_estimated_study_hours',
            'actual_study_hours',
            'study_hours_per_day',
            'study_days_per_week',
            'difficulty_preference',
            'include_weekends',
            'ai_provider',
            'confidence_score',
            'average_daily_progress',
            'days_until_exam',
            'completion_percentage',
            'is_on_track',
            'is_mock_period',
            'can_complete',
            'tasks',
            'reminders',
            'assessments',
            'adjustments'
        ]
        read_only_fields = [
            'id',
            'user',
            'created_at',
            'updated_at',
            'total_topics',
            'completed_topics',
            'actual_study_hours',
            'average_daily_progress'
        ]
    
    def get_subjects_list(self, obj):
        """Get list of subject names."""
        return list(obj.subjects.values_list('name', flat=True))
    
    def get_days_until_exam(self, obj):
        return obj.days_until_exam()
    
    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()
    
    def get_is_on_track(self, obj):
        return obj.is_on_track()
    
    def get_is_mock_period(self, obj):
        return obj.is_mock_period()
        
    def get_can_complete(self, obj):
        return obj.can_complete()


class StudyPlanListSerializer(serializers.ModelSerializer):
    """Simplified serializer for study plan listings."""
    
    exam_type_name = serializers.CharField(source='exam_type.name', read_only=True, allow_null=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    days_until_exam = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    is_on_track = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyPlan
        fields = [
            'id',
            'name',
            'exam_type_name',
            'user_name',
            'status',
            'is_favourite',
            'plan_type',
            'exam_date',
            'start_date',
            'total_topics',
            'completed_topics',
            'completion_percentage',
            'days_until_exam',
            'is_on_track',
            'is_mock_period',
            'can_complete',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'total_topics',
            'completed_topics'
        ]
    
    def get_days_until_exam(self, obj):
        return obj.days_until_exam()
    
    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()
    
    def get_is_on_track(self, obj):
        return obj.is_on_track()


class StudyPlanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new study plans."""
    
    subjects = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        many=True,
        write_only=True
    )
    
    class Meta:
        model = StudyPlan
        fields = [
            'name',
            'description',
            'exam_type',
            'subjects',
            'exam_date',
            'plan_type',
            'study_hours_per_day',
            'study_days_per_week',
            'difficulty_preference',
            'include_weekends'
        ]
    
    def create(self, validated_data):
        subjects = validated_data.pop('subjects', [])
        study_plan = StudyPlan.objects.create(**validated_data)
        study_plan.subjects.set(subjects)
        return study_plan


class StudyPlanUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating study plans."""
    
    class Meta:
        model = StudyPlan
        fields = [
            'name',
            'description',
            'status',
            'exam_date',
            'estimated_completion_date',
            'study_hours_per_day',
            'study_days_per_week',
            'difficulty_preference',
            'include_weekends'
        ]


class StudyTaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating study tasks."""
    
    class Meta:
        model = StudyTask
        fields = [
            'study_plan',
            'subject',
            'topic',
            'scheduled_start_date',
            'scheduled_end_date',
            'scheduled_start_time',
            'scheduled_end_time',
            'estimated_duration_hours',
            'description',
            'learning_objectives',
            'priority',
            'difficulty_level',
            'is_repeatable',
            'max_repeats',
            'resource_links',
            'question_ids'
        ]


class StudyTaskUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating study tasks."""
    
    class Meta:
        model = StudyTask
        fields = [
            'status',
            'completion_percentage',
            'understanding_level',
            'priority',
            'scheduled_start_date',
            'scheduled_end_date',
            'estimated_duration_hours',
            'description',
            'notes',
            'resource_links'
        ]


class StudyTaskCompleteSerializer(serializers.Serializer):
    """Serializer for marking a task as completed."""
    
    understanding_level = serializers.IntegerField(
        min_value=0,
        max_value=100,
        required=False,
        help_text="User's understanding of the topic (0-100)"
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Additional notes about task completion"
    )
    
    def update(self, instance, validated_data):
        instance.mark_completed(
            understanding_level=validated_data.get('understanding_level', 0),
            notes=validated_data.get('notes', '')
        )
        return instance


class StudySessionLogSerializer(serializers.Serializer):
    """Serializer for logging study sessions."""
    
    duration_seconds = serializers.IntegerField(
        min_value=60,
        help_text="Duration of study session in seconds"
    )
    understanding_level = serializers.IntegerField(
        min_value=0,
        max_value=100,
        required=False,
        allow_null=True,
        help_text="User's understanding level after session"
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Notes about the study session"
    )
    
    def update(self, instance, validated_data):
        instance.add_study_session(
            duration_seconds=validated_data.get('duration_seconds', 0),
            understanding_level=validated_data.get('understanding_level')
        )
        return instance


class PerformanceBasedAdjustmentSerializer(serializers.Serializer):
    """Serializer for requesting performance-based adjustments to a study plan."""
    
    ADJUSTMENT_REASON_CHOICES = [
        ('too_easy', 'Content is too easy'),
        ('too_difficult', 'Content is too difficult'),
        ('behind_schedule', 'Behind schedule'),
        ('ahead_of_schedule', 'Ahead of schedule'),
        ('weak_performance', 'Weak performance on topic'),
        ('strong_performance', 'Strong performance on topic'),
        ('time_constraint', 'Less time available'),
        ('need_review', 'Need more review'),
    ]
    
    reason = serializers.ChoiceField(choices=ADJUSTMENT_REASON_CHOICES)
    details = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Additional details about the adjustment request"
    )


class StudyStatisticsSerializer(serializers.Serializer):
    """Serializer for study plan statistics and analytics."""
    
    total_study_hours = serializers.FloatField()
    average_daily_hours = serializers.FloatField()
    completion_percentage = serializers.FloatField()
    topics_completed = serializers.IntegerField()
    topics_in_progress = serializers.IntegerField()
    topics_pending = serializers.IntegerField()
    average_understanding = serializers.FloatField()
    on_track = serializers.BooleanField()
    days_until_exam = serializers.IntegerField()
    estimated_hours_remaining = serializers.FloatField()
