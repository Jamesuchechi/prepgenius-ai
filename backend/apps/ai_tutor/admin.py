from django.contrib import admin
from .models import ChatSession, ChatMessage, ChatRateLimit


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'subject', 'exam_type', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'subject', 'exam_type', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Session Info', {
            'fields': ('id', 'user', 'title', 'is_active')
        }),
        ('Context', {
            'fields': ('subject', 'exam_type', 'metadata')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'role', 'content_preview', 'timestamp']
    list_filter = ['role', 'timestamp']
    search_fields = ['content', 'session__user__email']
    readonly_fields = ['id', 'timestamp']
    date_hierarchy = 'timestamp'
    
    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'


@admin.register(ChatRateLimit)
class ChatRateLimitAdmin(admin.ModelAdmin):
    list_display = ['user', 'message_count', 'window_start']
    list_filter = ['window_start']
    search_fields = ['user__email']
    readonly_fields = ['window_start']
