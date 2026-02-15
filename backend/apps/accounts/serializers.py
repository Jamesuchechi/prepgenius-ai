from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import User, EmailVerificationToken, PasswordResetToken
import secrets


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number',
            'profile_picture', 'cover_picture', 'bio', 'student_type', 'grade_level',
            'exam_targets', 'is_email_verified', 'timezone', 'language',
            'is_superuser', 'is_staff',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_email_verified']


class UserDetailSerializer(UserSerializer):
    """Detailed serializer for User model with additional fields."""
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['last_login_date']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password',
            'password_confirm', 'student_type', 'grade_level', 'exam_targets'
        ]
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError(
                {'password': 'Passwords do not match.'}
            )
        return attrs
    
    def create(self, validated_data):
        """Create user instance."""
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            student_type=validated_data.get('student_type', 'individual'),
            grade_level=validated_data.get('grade_level'),
            exam_targets=validated_data.get('exam_targets', [])
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate email and password."""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authentication')
            if not user.is_active:
                msg = 'User account is disabled.'
                raise serializers.ValidationError(msg, code='authentication')
            attrs['user'] = user
        else:
            msg = 'Must include "email" and "password".'
            raise serializers.ValidationError(msg, code='required')
        
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate passwords."""
        if attrs['new_password'] != attrs.pop('new_password_confirm'):
            raise serializers.ValidationError(
                {'new_password': 'Passwords do not match.'}
            )
        return attrs
    
    def validate_old_password(self, value):
        """Validate old password."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is not correct.')
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset."""
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Check if user exists."""
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                'User with this email does not exist.'
            )
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset."""
    
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate token and passwords."""
        token = attrs.get('token')
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({'token': 'Invalid token.'})
        
        if reset_token.is_used:
            raise serializers.ValidationError(
                {'token': 'This token has already been used.'}
            )
        
        if reset_token.is_expired:
            raise serializers.ValidationError(
                {'token': 'This token has expired.'}
            )
        
        if attrs['new_password'] != attrs.pop('new_password_confirm'):
            raise serializers.ValidationError(
                {'new_password': 'Passwords do not match.'}
            )
        
        attrs['reset_token'] = reset_token
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification."""
    
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """Validate email verification token."""
        email = attrs.get('email')
        token_str = attrs.get('token')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({'email': 'User with this email does not exist.'})
            
        try:
            verification_token = user.email_verification_token
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError('No verification token found for this user.')
            
        if verification_token.token != token_str:
             raise serializers.ValidationError({'token': 'Invalid verification code.'})
        
        if verification_token.is_used:
            raise serializers.ValidationError('This code has already been used.')
        
        if verification_token.is_expired:
            raise serializers.ValidationError('This code has expired.')
            
        attrs['user'] = user
        attrs['verification_token'] = verification_token
        return attrs
