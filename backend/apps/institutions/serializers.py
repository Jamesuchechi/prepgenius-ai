from rest_framework import serializers
from .models import Institution, StudentLink
from apps.accounts.serializers import UserSerializer

class InstitutionSerializer(serializers.ModelSerializer):
    """Serializer for Institution model."""
    admin_details = UserSerializer(source='admin', read_only=True)
    student_count = serializers.IntegerField(source='students.count', read_only=True)

    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'code', 'admin', 'admin_details', 
            'address', 'contact_email', 'website', 'logo',
            'student_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'admin', 'code']

    def create(self, validated_data):
        # Admin is set automatically in view
        validated_data['admin'] = self.context['request'].user
        return super().create(validated_data)

class StudentLinkSerializer(serializers.ModelSerializer):
    """Serializer for linking students to institutions."""
    student_details = UserSerializer(source='student', read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model = StudentLink
        fields = [
            'id', 'institution', 'institution_name', 
            'student', 'student_details', 
            'status', 'joined_at'
        ]
        read_only_fields = ['id', 'joined_at', 'student', 'institution']
