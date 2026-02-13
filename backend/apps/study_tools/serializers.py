from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'file_type', 'processed', 'processing_status', 'error_message', 'created_at', 'updated_at']
        read_only_fields = ['id', 'processed', 'processing_status', 'error_message', 'created_at', 'updated_at', 'file_type']

    def validate_file(self, value):
        # Validate file size (e.g., 10MB limit)
        limit = 10 * 1024 * 1024
        if value.size > limit:
            raise serializers.ValidationError('File too large. Size should not exceed 10 MiB.')
        return value
