import os
import django
import sys

# Setup Django environment
# Since we are running from backend/, we don't need to append backend to path
# sys.path.append(os.path.join(os.getcwd(), 'backend')) 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')  # Point to base settings
django.setup()

from django.contrib.auth import get_user_model
from apps.questions.models import Question, QuestionAttempt, Answer
from apps.content.models import Subject, Topic
from apps.analytics.models import ProgressTracker, TopicMastery
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.analytics.views import AnalyticsViewSet
import random

User = get_user_model()

def verify_analytics():
    print("Starting Analytics Verification...")
    
    # 1. Create User
    email = f"test_analytics_{random.randint(1000, 9999)}@example.com"
    user, created = User.objects.get_or_create(email=email, defaults={'username': email})
    if created:
        user.set_password("password123")
        user.save()
        print(f"Created test user: {email}")
    else:
        print(f"Using existing user: {email}")

    # 2. Create Subject and Topic
    subject, _ = Subject.objects.get_or_create(name="Mathematics")
    topic, _ = Topic.objects.get_or_create(name="Algebra", subject=subject)
    print("Created/Found Subject and Topic")

    # 3. Create Question
    question, _ = Question.objects.get_or_create(
        content="What is 2+2?",
        subject=subject,
        topic=topic,
        defaults={'question_type': 'MCQ', 'difficulty': 'EASY'}
    )
    
    # 4. Simulate Question Attempts
    print("Simulating question attempts...")
    # Attempt 1: Correct
    QuestionAttempt.objects.create(
        user=user,
        question=question,
        is_correct=True,
        score=1.0
    )
    
    # Attempt 2: Incorrect
    QuestionAttempt.objects.create(
        user=user,
        question=question,
        is_correct=False,
        score=0.0
    )

    # 5. Verify ProgressTracker
    tracker = ProgressTracker.objects.get(user=user)
    print(f"ProgressTracker: Attempts={tracker.total_questions_attempted}, Correct={tracker.total_correct_answers}")
    
    assert tracker.total_questions_attempted >= 2
    assert tracker.total_correct_answers >= 1
    print("✅ ProgressTracker verified")

    # 6. Verify TopicMastery
    mastery = TopicMastery.objects.get(user=user, topic=topic)
    print(f"TopicMastery: Attempts={mastery.total_attempts}, Correct={mastery.correct_attempts}, Any%={mastery.mastery_percentage}")
    
    assert mastery.total_attempts >= 2
    assert mastery.correct_attempts >= 1
    print("✅ TopicMastery verified")

    # 7. Verify API
    print("Verifying API...")
    factory = APIRequestFactory()
    view = AnalyticsViewSet.as_view({'get': 'overview'})
    
    request = factory.get('/api/analytics/overview/')
    force_authenticate(request, user=user)
    response = view(request)
    
    print(f"API Response: {response.status_code}")
    print(response.data)
    
    assert response.status_code == 200
    assert response.data['total_questions_attempted'] == tracker.total_questions_attempted
    print("✅ API Endpoint verified")

if __name__ == "__main__":
    try:
        verify_analytics()
        print("\n🎉 ALL CHECKS PASSED!")
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
