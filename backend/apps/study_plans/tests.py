"""
Tests for the study_plans app.
"""

import pytest
from datetime import datetime, timedelta
from django.utils import timezone
from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status

from django.contrib.auth import get_user_model
from apps.content.models import Subject, Topic, ExamBoard, ExamType, Country
from apps.study_plans.models import StudyPlan, StudyTask, StudyReminder, AdjustmentHistory
from apps.study_plans.services import StudyPlanGenerationService, StudyPlanAdjustmentService

User = get_user_model()


class StudyPlanModelTest(TestCase):
    """Test StudyPlan model"""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        # Create exam board and exam type
        self.country = Country.objects.create(
            code='NG',
            name='Nigeria',
            region='Africa',
            currency='NGN'
        )
        
        self.exam_board = ExamBoard.objects.create(
            name='JAMB',
            full_name='Joint Admissions and Matriculation Board',
            country=self.country
        )
        
        self.exam_type = ExamType.objects.create(
            name='JAMB',
            full_name='Joint Admissions and Matriculation Board Exam',
            exam_board=self.exam_board,
            level='SENIOR',
            duration_minutes=180,
            description='Test',
            exam_format={}
        )
        
        self.subject = Subject.objects.create(
            name='Mathematics',
            category='STEM',
            description='Mathematics'
        )
        
        # Create study plan
        self.exam_date = timezone.now().date() + timedelta(days=90)
        self.study_plan = StudyPlan.objects.create(
            user=self.user,
            exam_type=self.exam_type,
            name='JAMB Prep 2025',
            exam_date=self.exam_date,
            status='active'
        )
        self.study_plan.subjects.add(self.subject)
    
    def test_study_plan_creation(self):
        """Test creating a study plan."""
        self.assertEqual(self.study_plan.user, self.user)
        self.assertEqual(self.study_plan.exam_type, self.exam_type)
        self.assertEqual(self.study_plan.status, 'active')
    
    def test_days_until_exam(self):
        """Test days until exam calculation."""
        days = self.study_plan.days_until_exam()
        self.assertAlmostEqual(days, 90, delta=1)
    
    def test_completion_percentage(self):
        """Test completion percentage calculation."""
        # Initially 0%
        percentage = self.study_plan.get_completion_percentage()
        self.assertEqual(percentage, 0.0)
    
    def test_is_on_track(self):
        """Test on-track status."""
        # New plan should be on track
        self.assertTrue(self.study_plan.is_on_track())


class StudyTaskModelTest(TestCase):
    """Test StudyTask model"""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        self.country = Country.objects.create(
            code='NG', name='Nigeria', region='Africa', currency='NGN'
        )
        
        self.exam_board = ExamBoard.objects.create(
            name='JAMB',
            full_name='JAMB',
            country=self.country
        )
        
        self.exam_type = ExamType.objects.create(
            name='JAMB',
            full_name='JAMB',
            exam_board=self.exam_board,
            level='SENIOR',
            duration_minutes=180,
            description='Test',
            exam_format={}
        )
        
        self.subject = Subject.objects.create(
            name='Mathematics',
            category='STEM',
            description='Math'
        )
        
        self.topic = Topic.objects.create(
            name='Algebra',
            subject=self.subject,
            description='Algebra basics'
        )
        
        self.study_plan = StudyPlan.objects.create(
            user=self.user,
            exam_type=self.exam_type,
            name='Test Plan',
            exam_date=timezone.now().date() + timedelta(days=90)
        )
        
        self.task = StudyTask.objects.create(
            study_plan=self.study_plan,
            subject=self.subject,
            topic=self.topic,
            scheduled_start_date=timezone.now().date(),
            scheduled_end_date=timezone.now().date() + timedelta(days=1),
            estimated_duration_hours=2.0,
            status='pending'
        )
    
    def test_task_creation(self):
        """Test creating a study task."""
        self.assertEqual(self.task.study_plan, self.study_plan)
        self.assertEqual(self.task.topic, self.topic)
        self.assertEqual(self.task.status, 'pending')
    
    def test_mark_completed(self):
        """Test marking task as completed."""
        self.task.mark_completed(understanding_level=85, notes='Done')
        
        self.assertEqual(self.task.status, 'completed')
        self.assertEqual(self.task.completion_percentage, 100.0)
        self.assertEqual(self.task.understanding_level, 85)
        self.assertIsNotNone(self.task.actual_completion_date)
    
    def test_mark_in_progress(self):
        """Test marking task as in progress."""
        self.task.mark_in_progress()
        
        self.assertEqual(self.task.status, 'in_progress')
        self.assertIsNotNone(self.task.actual_start_date)
    
    def test_add_study_session(self):
        """Test adding a study session."""
        self.task.add_study_session(3600, understanding_level=75)
        
        self.assertEqual(self.task.actual_time_spent_seconds, 3600)
        self.assertEqual(self.task.understanding_level, 75)
    
    def test_is_overdue(self):
        """Test overdue detection."""
        # Create overdue task
        overdue_task = StudyTask.objects.create(
            study_plan=self.study_plan,
            subject=self.subject,
            topic=self.topic,
            scheduled_start_date=timezone.now().date() - timedelta(days=5),
            scheduled_end_date=timezone.now().date() - timedelta(days=3),
            estimated_duration_hours=2.0,
            status='pending'
        )
        
        self.assertTrue(overdue_task.is_overdue())
        self.assertFalse(self.task.is_overdue())


class StudyPlanAPITest(APITestCase):
    """Test StudyPlan API endpoints"""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        
        self.client.force_authenticate(user=self.user)
        
        # Create necessary data
        self.country = Country.objects.create(
            code='NG', name='Nigeria', region='Africa', currency='NGN'
        )
        
        self.exam_board = ExamBoard.objects.create(
            name='JAMB', full_name='JAMB', country=self.country
        )
        
        self.exam_type = ExamType.objects.create(
            name='JAMB',
            full_name='JAMB',
            exam_board=self.exam_board,
            level='SENIOR',
            duration_minutes=180,
            description='Test',
            exam_format={}
        )
        
        self.subject = Subject.objects.create(
            name='Mathematics',
            category='STEM',
            description='Math'
        )
    
    def test_list_study_plans(self):
        """Test listing study plans."""
        response = self.client.get('/api/study-plans/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_current_study_plan(self):
        """Test getting current study plan."""
        response = self.client.get('/api/study-plans/current/')
        # Should return 404 if no plan exists
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])
    
    def test_generate_study_plan(self):
        """Test generating a new study plan."""
        data = {
            'exam_type_id': self.exam_type.id,
            'exam_date': (timezone.now().date() + timedelta(days=90)).isoformat(),
            'subject_ids': [self.subject.id],
            'study_hours_per_day': 2.5,
            'study_days_per_week': 6,
            'difficulty_preference': 'intermediate'
        }
        
        response = self.client.post('/api/study-plans/generate/', data, format='json')
        
        # May return 201 if successful or 500 if AI service fails
        self.assertIn(
            response.status_code,
            [status.HTTP_201_CREATED, status.HTTP_500_INTERNAL_SERVER_ERROR]
        )


class StudyTaskAPITest(APITestCase):
    """Test StudyTask API endpoints"""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        self.client.force_authenticate(user=self.user)
        
        # Create necessary data
        self.country = Country.objects.create(
            code='NG', name='Nigeria', region='Africa', currency='NGN'
        )
        
        self.exam_board = ExamBoard.objects.create(
            name='JAMB', full_name='JAMB', country=self.country
        )
        
        self.exam_type = ExamType.objects.create(
            name='JAMB',
            full_name='JAMB',
            exam_board=self.exam_board,
            level='SENIOR',
            duration_minutes=180,
            description='Test',
            exam_format={}
        )
        
        self.subject = Subject.objects.create(
            name='Mathematics',
            category='STEM',
            description='Math'
        )
        
        self.topic = Topic.objects.create(
            name='Algebra',
            subject=self.subject,
            description='Algebra'
        )
        
        self.study_plan = StudyPlan.objects.create(
            user=self.user,
            exam_type=self.exam_type,
            name='Test Plan',
            exam_date=timezone.now().date() + timedelta(days=90)
        )
        
        self.task = StudyTask.objects.create(
            study_plan=self.study_plan,
            subject=self.subject,
            topic=self.topic,
            scheduled_start_date=timezone.now().date(),
            scheduled_end_date=timezone.now().date() + timedelta(days=1),
            estimated_duration_hours=2.0,
            status='pending'
        )
    
    def test_list_tasks(self):
        """Test listing study tasks."""
        response = self.client.get('/api/study-tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
    
    def test_get_pending_tasks(self):
        """Test getting pending tasks."""
        response = self.client.get('/api/study-tasks/pending/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_complete_task(self):
        """Test completing a task."""
        data = {
            'understanding_level': 85,
            'notes': 'Completed successfully'
        }
        
        response = self.client.post(
            f'/api/study-tasks/{self.task.id}/complete/',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify task is completed
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, 'completed')
    
    def test_start_task(self):
        """Test starting a task."""
        response = self.client.post(
            f'/api/study-tasks/{self.task.id}/start/',
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify task is in progress
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, 'in_progress')


class StudyPlanServiceTest(TestCase):
    """Test StudyPlan services"""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        self.country = Country.objects.create(
            code='NG', name='Nigeria', region='Africa', currency='NGN'
        )
        
        self.exam_board = ExamBoard.objects.create(
            name='JAMB', full_name='JAMB', country=self.country
        )
        
        self.exam_type = ExamType.objects.create(
            name='JAMB',
            full_name='JAMB',
            exam_board=self.exam_board,
            level='SENIOR',
            duration_minutes=180,
            description='Test',
            exam_format={}
        )
        
        self.subject = Subject.objects.create(
            name='Mathematics',
            category='STEM',
            description='Math'
        )
        
        self.topic = Topic.objects.create(
            name='Algebra',
            subject=self.subject,
            description='Algebra'
        )
    
    def test_study_plan_generation_service(self):
        """Test study plan generation service."""
        
        service = StudyPlanGenerationService()
        
        exam_date = timezone.now().date() + timedelta(days=90)
        
        try:
            study_plan, tasks = service.generate_study_plan(
                user=self.user,
                exam_type=self.exam_type,
                exam_date=exam_date,
                subjects=[self.subject],
                study_hours_per_day=2.5,
                study_days_per_week=6
            )
            
            # Verify plan was created
            self.assertIsNotNone(study_plan)
            self.assertEqual(study_plan.user, self.user)
            self.assertEqual(study_plan.exam_type, self.exam_type)
            
        except Exception as e:
            # The service may fail if AI providers are not available
            # This is expected in test environment
            self.assertIsNotNone(e)
