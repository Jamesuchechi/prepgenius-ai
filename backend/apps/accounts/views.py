from rest_framework import viewsets, status, generics, views
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.html import strip_tags
from django.template.loader import render_to_string
from django.conf import settings
from datetime import timedelta
import secrets
from .models import User, EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserSerializer, UserDetailSerializer, UserRegistrationSerializer,
    UserLoginSerializer, ChangePasswordSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, EmailVerificationSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'retrieve' and self.kwargs.get('pk') == 'me':
            return UserDetailSerializer
        return self.serializer_class
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user profile."""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update current user profile."""
        user = request.user
        serializer = UserSerializer(
            user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """Change user password."""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response(
                {'detail': 'Password changed successfully.'},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from django_q.tasks import async_task
from .tasks import send_verification_email_task

class UserRegistrationView(generics.CreateAPIView):
    """Registration endpoint for new users."""
    
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Create user and send verification email."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate 6-digit OTP
        token = str(secrets.randbelow(1000000)).zfill(6)
        expires_at = timezone.now() + timedelta(hours=24)
        
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Send verification email asynchronously
        async_task(
            'apps.accounts.tasks.send_verification_email_task',
            user.email,
            user.get_full_name() or user.email,
            token
        )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'detail': 'Registration successful. Please verify your email.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """Login endpoint for users."""
    
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        """Authenticate user and return tokens."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Update last login
        user.last_login_date = timezone.now()
        user.save(update_fields=['last_login_date'])
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class EmailVerificationView(views.APIView):
    """Endpoint for verifying user email."""
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Verify user email with token."""
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        token = serializer.validated_data['verification_token']
        
        user.is_email_verified = True
        user.email_verified_at = timezone.now()
        user.save()
        
        token.is_used = True
        token.used_at = timezone.now()
        token.save()
        
        return Response({
            'detail': 'Email verified successfully.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class ResendVerificationView(views.APIView):
    """Endpoint for resending verification email."""
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Resend verification email to user."""
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Return 200 even if user not found to prevent enumeration, or 400 if we don't care about that for now.
            # For UX/Dev ease, let's return 404 or 400. Or, just say "If account exists..."
            return Response({
                'detail': 'If an account exists with this email, a new code has been sent.'
            }, status=status.HTTP_200_OK)
            
        if user.is_email_verified:
            return Response({'detail': 'This account is already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate new 6-digit OTP
        token = str(secrets.randbelow(1000000)).zfill(6)
        expires_at = timezone.now() + timedelta(hours=24)
        
        # Update or create token
        EmailVerificationToken.objects.update_or_create(
            user=user,
            defaults={
                'token': token,
                'expires_at': expires_at,
                'is_used': False
            }
        )
        
        # Send email asynchronously
        async_task(
            'apps.accounts.tasks.send_verification_email_task',
            user.email,
            user.get_full_name() or user.email,
            token
        )
        
        return Response({
            'detail': 'A new verification code has been sent.'
        }, status=status.HTTP_200_OK)


class PasswordResetRequestView(generics.GenericAPIView):
    """Request password reset."""
    
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Generate and send password reset token."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate password reset token
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=1)
        
        # Delete old tokens for this user
        PasswordResetToken.objects.filter(user=user, is_used=False).delete()
        
        # Create new token
        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # Send reset email asynchronously
        reset_url = f"{settings.FRONTEND_URL}/auth/reset-password/{token}"
        async_task(
            'apps.accounts.tasks.send_password_reset_email_task',
            user.email,
            user.get_full_name() or user.email,
            reset_url
        )
        
        return Response({
            'detail': 'Password reset link has been sent to your email.'
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(generics.GenericAPIView):
    """Confirm password reset with token."""
    
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Reset password using token."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reset_token = serializer.validated_data['reset_token']
        user = reset_token.user
        
        # Update password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Mark token as used
        reset_token.is_used = True
        reset_token.used_at = timezone.now()
        reset_token.save()
        
        return Response({
            'detail': 'Password has been reset successfully.'
        }, status=status.HTTP_200_OK)


class UserLogoutView(views.APIView):
    """User logout endpoint."""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Logout user (blacklist refresh token)."""
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {'detail': 'Logged out successfully.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class GoogleLoginView(generics.GenericAPIView):
    """Google OAuth login endpoint."""
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Verify Google token and authenticate/create user."""
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify token with Google
            # Note: In production, verify against GOOGLE_CLIENT_ID
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            
            # Get user info from token
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            profile_picture = idinfo.get('picture', '')
            
            # Check if user exists or create new one
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_email_verified': True,  # Google verified
                    'student_type': 'individual',
                    'username': email
                }
            )
            
            # If user exists but is not verified, verify them since they used Google
            if not created and not user.is_email_verified:
                user.is_email_verified = True
                user.save(update_fields=['is_email_verified'])
            
            # Update profile picture if not set
            if profile_picture and not user.profile_picture:
                # Note: We're just storing the URL here ideally, but for now we skip 
                # saving external URL to ImageField to avoid complexity
                pass
            
            # Update last login
            user.last_login_date = timezone.now()
            user.save(update_fields=['last_login_date'])
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
