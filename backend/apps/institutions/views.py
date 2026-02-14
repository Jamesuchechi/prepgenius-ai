from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Institution, StudentLink
from .serializers import InstitutionSerializer, StudentLinkSerializer
import secrets

class IsInstitutionAdminOrSuperUser(permissions.BasePermission):
    """
    Custom permission to only allow admin of an institution or superusers to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user?
        # Maybe restrict to members only? 
        # For now, let's say only admin/members/superuser can view details
        
        if request.user.is_superuser:
            return True
        
        if isinstance(obj, Institution):
            return obj.admin == request.user
        
        if isinstance(obj, StudentLink):
            return obj.institution.admin == request.user

        return False

class InstitutionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing institution instances.
    """
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset based on user role.
        - Superusers see all.
        - Institution admins see their own.
        - Students see institutions they belong to.
        """
        user = self.request.user
        if user.is_superuser:
            return Institution.objects.all()
        
        # Return institutions where user is admin or a student
        return Institution.objects.filter(
            models.Q(admin=user) | 
            models.Q(students__student=user, students__status='active')
        ).distinct()

    def perform_create(self, serializer):
        # Generate a unique 6-character code
        code = secrets.token_hex(3).upper()
        while Institution.objects.filter(code=code).exists():
             code = secrets.token_hex(3).upper()
        
        serializer.save(
            admin=self.request.user,
            code=code
        )

    @action(detail=False, methods=['post'])
    def join(self, request):
        """Allow a student to join an institution via code."""
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'Institution code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        institution = get_object_or_404(Institution, code=code)
        
        # Check if link already exists
        if StudentLink.objects.filter(institution=institution, student=request.user).exists():
            return Response(
                {'error': 'You have already joined or requested to join this institution'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        StudentLink.objects.create(
            institution=institution,
            student=request.user,
            status='pending' 
        )
        
        return Response(
            {'message': f'Request sent to join {institution.name}'},
            status=status.HTTP_201_CREATED
        )

class StudentManagementViewSet(viewsets.ModelViewSet):
    """
    Manage students within an institution.
    """
    serializer_class = StudentLinkSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstitutionAdminOrSuperUser]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return StudentLink.objects.all()
            
        # Only return links for institutions managed by this user
        return StudentLink.objects.filter(institution__admin=user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        link = self.get_object()
        link.status = 'active'
        link.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        link = self.get_object()
        link.status = 'rejected'
        link.save()
        return Response({'status': 'rejected'})
