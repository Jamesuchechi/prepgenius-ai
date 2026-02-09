from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow users to edit their own profile.
    """
    def has_object_permission(self, request, view, obj):
        # Allow read permissions to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only to the user who owns the profile
        return obj == request.user


class IsEmailVerified(permissions.BasePermission):
    """
    Permission to check if user has verified their email.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_email_verified