from django.contrib import admin
from django.utils.html import format_html
from .models import StudyPlan, StudyTask, StudyReminder, AdjustmentHistory


class StudyTaskInline(admin.TabularInline):
    """Inline admin for study tasks within study plans."""
    model = StudyTask
    extra = 0
    fields = ['subject', 'topic', 'scheduled_start_date', 'scheduled_end_date', 'status', 'priority']
    ordering = ['scheduled_start_date']


class StudyReminderInline(admin.TabularInline):
    """Inline admin for reminders within study plans."""
    model = StudyReminder
    extra = 0
    fields = ['reminder_type', 'scheduled_datetime', 'is_active', 'last_sent']
    ordering = ['scheduled_datetime']


class AdjustmentHistoryInline(admin.TabularInline):
    """Inline admin for adjustment history within study plans."""
    model = AdjustmentHistory
    extra = 0
    fields = ['adjustment_type', 'reason', 'created_at']
    readonly_fields = ['created_at']
    can_delete = False


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'user_display',
        'exam_type',
        'status_badge',
        'exam_date',
        'progress_bar',
        'created_at'
    ]
    list_filter = ['status', 'plan_type', 'exam_type', 'created_at']
    search_fields = ['name', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = [
        'created_at',
        'updated_at',
        'completion_percentage_display',
        'days_until_exam_display',
        'progress_details'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'user', 'exam_type')
        }),
        ('Dates', {
            'fields': ('exam_date', 'start_date', 'estimated_completion_date', 'actual_completion_date')
        }),
        ('Configuration', {
            'fields': (
                'plan_type',
                'difficulty_preference',
                'study_hours_per_day',
                'study_days_per_week',
                'include_weekends'
            )
        }),
        ('Status & Metrics', {
            'fields': (
                'status',
                'completion_percentage_display',
                'total_topics',
                'completed_topics',
                'total_estimated_study_hours',
                'actual_study_hours',
                'average_daily_progress',
                'days_until_exam_display'
            )
        }),
        ('AI Generation', {
            'fields': ('ai_provider', 'confidence_score', 'ai_prompt_used'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [StudyTaskInline, StudyReminderInline, AdjustmentHistoryInline]
    filter_horizontal = ['subjects']
    
    def user_display(self, obj):
        return f"{obj.user.get_full_name()} ({obj.user.email})"
    user_display.short_description = "User"
    
    def status_badge(self, obj):
        colors = {
            'draft': '#808080',
            'active': '#28a745',
            'paused': '#ffc107',
            'completed': '#17a2b8',
            'abandoned': '#dc3545'
        }
        color = colors.get(obj.status, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"
    
    def progress_bar(self, obj):
        percentage = obj.get_completion_percentage()
        color = '#28a745' if percentage >= 80 else '#ffc107' if percentage >= 50 else '#dc3545'
        return format_html(
            '<div style="width: 100px; height: 20px; background-color: #e9ecef; border-radius: 3px; overflow: hidden;">'
            '<div style="width: {}%; height: 100%; background-color: {}; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">'
            '{}%'
            '</div></div>',
            percentage,
            color,
            round(percentage, 1)
        )
    progress_bar.short_description = "Progress"
    
    def completion_percentage_display(self, obj):
        return f"{obj.get_completion_percentage():.1f}%"
    completion_percentage_display.short_description = "Completion Percentage"
    
    def days_until_exam_display(self, obj):
        days = obj.days_until_exam()
        if days < 0:
            return format_html('<span style="color: #dc3545;">Exam passed {}</span>', abs(days))
        elif days == 0:
            return format_html('<span style="color: #dc3545;">Today</span>')
        else:
            return format_html('<span style="color: #28a745;">{} days remaining</span>', days)
    days_until_exam_display.short_description = "Days Until Exam"
    
    def progress_details(self, obj):
        return f"""
        <div style="background-color: #f8f9fa; padding: 10px; border-radius: 3px;">
            <p><strong>Total Topics:</strong> {obj.total_topics}</p>
            <p><strong>Completed Topics:</strong> {obj.completed_topics}</p>
            <p><strong>Estimated Study Hours:</strong> {obj.total_estimated_study_hours:.1f}</p>
            <p><strong>Actual Study Hours:</strong> {obj.actual_study_hours:.1f}</p>
            <p><strong>On Track:</strong> {'Yes' if obj.is_on_track() else 'No'}</p>
        </div>
        """
    progress_details.short_description = "Progress Details"


@admin.register(StudyTask)
class StudyTaskAdmin(admin.ModelAdmin):
    list_display = [
        'topic',
        'subject',
        'study_plan_display',
        'status_badge',
        'scheduled_dates',
        'priority_badge',
        'understanding_level_display'
    ]
    list_filter = [
        'status',
        'priority',
        'difficulty_level',
        'scheduled_start_date',
        'study_plan__exam_type'
    ]
    search_fields = [
        'topic__name',
        'subject__name',
        'study_plan__name',
        'study_plan__user__email'
    ]
    readonly_fields = [
        'created_at',
        'updated_at',
        'actual_time_spent_hours',
        'is_overdue_display',
        'days_until_deadline_display'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('study_plan', 'subject', 'topic', 'description')
        }),
        ('Scheduling', {
            'fields': (
                'scheduled_start_date',
                'scheduled_start_time',
                'scheduled_end_date',
                'scheduled_end_time',
                'estimated_duration_hours'
            )
        }),
        ('Status & Progress', {
            'fields': (
                'status',
                'priority',
                'difficulty_level',
                'completion_percentage',
                'understanding_level',
                'actual_start_date',
                'actual_completion_date',
                'actual_time_spent_hours',
                'is_overdue_display',
                'days_until_deadline_display'
            )
        }),
        ('Learning & Resources', {
            'fields': ('learning_objectives', 'notes', 'resource_links', 'question_ids')
        }),
        ('Reminders & Repetition', {
            'fields': ('reminder_sent', 'reminder_date', 'reminder_time', 'is_repeatable', 'repeat_count', 'max_repeats')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def study_plan_display(self, obj):
        return obj.study_plan.name
    study_plan_display.short_description = "Study Plan"
    
    def status_badge(self, obj):
        colors = {
            'pending': '#808080',
            'in_progress': '#ffc107',
            'completed': '#28a745',
            'skipped': '#6c757d',
            'revisit': '#dc3545'
        }
        color = colors.get(obj.status, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"
    
    def priority_badge(self, obj):
        colors = {
            'low': '#17a2b8',
            'medium': '#ffc107',
            'high': '#ff8c00',
            'critical': '#dc3545'
        }
        color = colors.get(obj.priority, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_priority_display()
        )
    priority_badge.short_description = "Priority"
    
    def scheduled_dates(self, obj):
        return f"{obj.scheduled_start_date} to {obj.scheduled_end_date}"
    scheduled_dates.short_description = "Scheduled"
    
    def understanding_level_display(self, obj):
        return f"{obj.understanding_level}%"
    understanding_level_display.short_description = "Understanding"
    
    def actual_time_spent_hours(self, obj):
        return f"{obj.actual_time_spent_seconds / 3600:.2f}h"
    actual_time_spent_hours.short_description = "Actual Time Spent"
    
    def is_overdue_display(self, obj):
        if obj.is_overdue():
            return format_html('<span style="color: #dc3545;"><strong>Yes - Overdue</strong></span>')
        return format_html('<span style="color: #28a745;">No</span>')
    is_overdue_display.short_description = "Overdue"
    
    def days_until_deadline_display(self, obj):
        days = obj.get_days_until_deadline()
        if days < 0:
            return format_html('<span style="color: #dc3545;">Overdue by {} days</span>', abs(days))
        else:
            return format_html('<span style="color: #28a745;">{} days</span>', days)
    days_until_deadline_display.short_description = "Days Until Deadline"


@admin.register(StudyReminder)
class StudyReminderAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'user_display',
        'reminder_type_badge',
        'scheduled_datetime',
        'status_badge',
        'last_sent'
    ]
    list_filter = ['reminder_type', 'frequency', 'is_active', 'scheduled_datetime']
    search_fields = ['title', 'message', 'user__email']
    readonly_fields = ['last_sent', 'created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'message', 'reminder_type')
        }),
        ('Scheduling', {
            'fields': ('scheduled_datetime', 'frequency', 'next_send', 'last_sent')
        }),
        ('Related Items', {
            'fields': ('study_task', 'study_plan')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def user_display(self, obj):
        return f"{obj.user.get_full_name()} ({obj.user.email})"
    user_display.short_description = "User"
    
    def reminder_type_badge(self, obj):
        colors = {
            'task_start': '#17a2b8',
            'task_deadline': '#fd7e14',
            'weak_topic': '#ffc107',
            'daily_goal': '#28a745'
        }
        color = colors.get(obj.reminder_type, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_reminder_type_display()
        )
    reminder_type_badge.short_description = "Type"
    
    def status_badge(self, obj):
        color = '#28a745' if obj.is_active else '#6c757d'
        status_text = 'Active' if obj.is_active else 'Inactive'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            status_text
        )
    status_badge.short_description = "Status"


@admin.register(AdjustmentHistory)
class AdjustmentHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'study_plan_display',
        'adjustment_type_badge',
        'reason_short',
        'performance_metric',
        'created_at'
    ]
    list_filter = ['adjustment_type', 'study_plan', 'created_at']
    search_fields = ['study_plan__name', 'reason', 'performance_metric']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Adjustment Information', {
            'fields': ('study_plan', 'adjustment_type', 'reason')
        }),
        ('Related Task', {
            'fields': ('task',)
        }),
        ('Performance Data', {
            'fields': ('performance_metric', 'performance_threshold', 'actual_performance')
        }),
        ('Change Details', {
            'fields': ('old_value', 'new_value')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    can_delete = True
    
    def study_plan_display(self, obj):
        return obj.study_plan.name
    study_plan_display.short_description = "Study Plan"
    
    def adjustment_type_badge(self, obj):
        colors = {
            'difficulty_increase': '#dc3545',
            'difficulty_decrease': '#28a745',
            'pace_adjustment': '#ffc107',
            'topic_added': '#17a2b8',
            'topic_removed': '#6c757d',
            'deadline_extended': '#fd7e14',
            'priority_updated': '#6f42c1'
        }
        color = colors.get(obj.adjustment_type, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_adjustment_type_display()
        )
    adjustment_type_badge.short_description = "Type"
    
    def reason_short(self, obj):
        return obj.reason[:50] + '...' if len(obj.reason) > 50 else obj.reason
    reason_short.short_description = "Reason"
