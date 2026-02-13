from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'file_type', 'processing_status', 'created_at')
    list_filter = ('processing_status', 'file_type', 'created_at')
    search_fields = ('title', 'user__username', 'user__email')
    readonly_fields = ('processed', 'error_message', 'created_at', 'updated_at')
