from django.contrib import admin
from .models import (
    Country, ExamBoard, ExamType, Subject, 
    ExamTypeSubject, Topic, Subtopic, TopicExamMapping, Syllabus, SyllabusTopic
)

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'region', 'is_active', 'launch_date']
    list_filter = ['region', 'is_active']
    search_fields = ['name', 'code']

@admin.register(ExamBoard)
class ExamBoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'full_name', 'country', 'is_active']
    list_filter = ['country', 'is_active', 'is_international']
    search_fields = ['name', 'full_name']

@admin.register(ExamType)
class ExamTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'exam_board', 'level', 'is_active']
    list_filter = ['exam_board__country', 'level', 'is_active']
    search_fields = ['name', 'full_name']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_core', 'is_active']
    list_filter = ['category', 'is_core', 'is_active']
    search_fields = ['name']

@admin.register(ExamTypeSubject)
class ExamTypeSubjectAdmin(admin.ModelAdmin):
    list_display = ['exam_type', 'subject', 'is_compulsory']
    list_filter = ['exam_type', 'is_compulsory']
    search_fields = ['exam_type__name', 'subject__name']

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject', 'difficulty', 'order', 'is_active']
    list_filter = ['subject', 'difficulty', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['subject', 'order']

@admin.register(Subtopic)
class SubtopicAdmin(admin.ModelAdmin):
    list_display = ['name', 'topic', 'order', 'is_active']
    list_filter = ['topic__subject', 'is_active']
    search_fields = ['name', 'content_summary']

@admin.register(TopicExamMapping)
class TopicExamMappingAdmin(admin.ModelAdmin):
    list_display = ['topic', 'exam_type', 'weight_percentage', 'frequency']
    list_filter = ['exam_type', 'frequency']

class SyllabusTopicInline(admin.TabularInline):
    model = SyllabusTopic
    extra = 1

@admin.register(Syllabus)
class SyllabusAdmin(admin.ModelAdmin):
    list_display = ['exam_type', 'subject', 'year', 'version', 'is_current']
    list_filter = ['exam_type', 'subject', 'is_current']
    inlines = [SyllabusTopicInline]
