from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import User, EmailVerificationToken, PasswordResetToken
from datetime import timedelta
from django.utils import timezone
import secrets


class UserModelTestCase(TestCase):
    """Test cases for User model."""
    
    def setUp(self):
        """Set up test data."""
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'TestPassword123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_create_user(self):
        """Test creating a regular user."""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data['email'])
        self.assertTrue(user.check_password(self.user_data['password']))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
    
    def test_create_superuser(self):
        """Test creating a superuser."""
        user = User.objects.create_superuser(**self.user_data)
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
    
    def test_user_str_representation(self):
        """Test string representation of user."""
        user = User.objects.create_user(**self.user_data)
        expected = f"{user.get_full_name()} ({user.email})"
        self.assertEqual(str(user), expected)


class UserRegistrationTestCase(APITestCase):
    """Test cases for user registration."""
    
    def setUp(self):
        """Set up test client."""
        self.client = APIClient()
        self.registration_url = reverse('accounts:register')
    
    def test_user_registration_success(self):
        """Test successful user registration."""
        data = {
            'email': 'newuser@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'TestPassword123!',
            'password_confirm': 'TestPassword123!',
            'student_type': 'individual',
            'exam_targets': ['jamb']
        }
        
        response = self.client.post(self.registration_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)
        self.assertTrue(User.objects.filter(email=data['email']).exists())
    
    def test_registration_password_mismatch(self):
        """Test registration with mismatched passwords."""
        data = {
            'email': 'user@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'TestPassword123!',
            'password_confirm': 'DifferentPassword!',
            'student_type': 'individual'
        }
        
        response = self.client.post(self.registration_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_registration_duplicate_email(self):
        """Test registration with existing email."""
        User.objects.create_user(
            email='existing@example.com',
            password='Password123!',
            first_name='Test',
            last_name='User'
        )
        
        data = {
            'email': 'existing@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'TestPassword123!',
            'password_confirm': 'TestPassword123!',
            'student_type': 'individual'
        }
        
        response = self.client.post(self.registration_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTestCase(APITestCase):
    """Test cases for user login."""
    
    def setUp(self):
        """Set up test user and client."""
        self.client = APIClient()
        self.login_url = reverse('accounts:login')
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'TestPassword123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User.objects.create_user(**self.user_data)
    
    def test_login_success(self):
        """Test successful login."""
        data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
    
    def test_login_with_wrong_password(self):
        """Test login with incorrect password."""
        data = {
            'email': self.user_data['email'],
            'password': 'WrongPassword123!'
        }
        
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_login_with_nonexistent_user(self):
        """Test login with non-existent email."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'Password123!'
        }
        
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserProfileTestCase(APITestCase):
    """Test cases for user profile endpoints."""
    
    def setUp(self):
        """Set up test user and client."""
        self.client = APIClient()
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'TestPassword123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User.objects.create_user(**self.user_data)
        
        # Generate tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
    
    def test_get_current_user_profile(self):
        """Test getting current user profile."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        url = reverse('accounts:user-me')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user_data['email'])
    
    def test_update_user_profile(self):
        """Test updating user profile."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        url = reverse('accounts:user-update-profile')
        
        data = {
            'first_name': 'Updated',
            'bio': 'New bio'
        }
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.assertEqual(response.data['bio'], 'New bio')


class PasswordResetTestCase(APITestCase):
    """Test cases for password reset functionality."""
    
    def setUp(self):
        """Set up test user and client."""
        self.client = APIClient()
        self.user_data = {
            'email': 'testuser@example.com',
            'password': 'TestPassword123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User.objects.create_user(**self.user_data)
        self.password_reset_url = reverse('accounts:password_reset')
    
    def test_password_reset_request(self):
        """Test requesting password reset."""
        data = {'email': self.user_data['email']}
        
        response = self.client.post(self.password_reset_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            PasswordResetToken.objects.filter(user=self.user).exists()
        )
    
    def test_password_reset_request_nonexistent_email(self):
        """Test password reset with non-existent email."""
        data = {'email': 'nonexistent@example.com'}
        
        response = self.client.post(self.password_reset_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
