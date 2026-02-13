import os
import sys
import json

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')

import django
django.setup()

# Imports MUST be after django.setup()
from django.contrib.auth import get_user_model
from apps.questions.models import Question
from apps.quiz.models import Quiz, QuizAttempt
from apps.content.models import Subject
from rest_framework.test import APIClient

def test_quiz_api():
    User = get_user_model()
    # Ensure user exists
    try:
        user = User.objects.get(email='api_test@example.com')
        # Reset password to ensure login works
        user.set_password('password123')
        user.save()
    except User.DoesNotExist:
        user = User.objects.create_user(username='test_api_user', email='api_test@example.com', password='password123')

    # Ensure subject exists
    subject, _ = Subject.objects.get_or_create(
        name="General Knowledge", 
        defaults={"category": "STEM", "description": "Gen Know"}
    )
    
    # Client setup
    client = APIClient()
    
    # 1. Login
    print("\n--- 1. Testing Login ---")
    response = client.post('/api/auth/login/', {'email': 'api_test@example.com', 'password': 'password123'})
    if response.status_code != 200:
        print(f"Login failed: {response.data}")
        return
    
    print(f"Login Response Keys: {response.data.keys()}")
    # Check for likely token keys
    if 'access' in response.data:
        token = response.data['access']
    elif 'token' in response.data:
        token = response.data['token']
        if isinstance(token, dict) and 'access' in token:
            token = token['access']
    elif 'tokens' in response.data:
        token = response.data['tokens']['access']
    else:
        print(f"Comparison: {response.data}")
        return
    
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    print("Login successful, token received.")
    
    # 2. Generate Quiz
    print("\n--- 2. Testing Quiz Generation ---")
    payload = {
        "topic": "African History",
        "difficulty": "EASY",
        "question_count": 3,
        "exam_type": "MCQ",
        "subject_id": subject.id
    }
    response = client.post('/api/quiz/quizzes/generate/', payload, format='json')
    if response.status_code != 201:
        print(f"Generation failed: {response.status_code} - {response.data}")
        return
        
    quiz_data = response.data
    quiz_id = quiz_data['id']
    print(f"Quiz Generated: {quiz_data['title']} (ID: {quiz_id})")
    print(f"Questions: {len(quiz_data['questions'])}")
    
    # 3. Get Quiz Details
    print("\n--- 3. Testing Get Quiz ---")
    response = client.get(f'/api/quiz/quizzes/{quiz_id}/')
    if response.status_code != 200:
        print(f"Get Quiz failed: {response.status_code}")
        return
    print("Quiz details retrieved successfully.")
    
    # 4. Submit Quiz
    print("\n--- 4. Testing Quiz Submission ---")
    questions = response.data['questions']
    answers_payload = []
    
    for q in questions:
        # Pick the first answer (naive attempt)
        # Note: Serializer returns answers list
        if q['answers']:
            first_option = q['answers'][0]['content']
            answers_payload.append({
                "question_id": q['id'],
                "selected_option": first_option
            })
        
    submit_payload = {
        "answers": answers_payload
    }
    
    response = client.post(f'/api/quiz/quizzes/{quiz_id}/submit/', submit_payload, format='json')
    if response.status_code != 200:
        print(f"Submission failed: {response.status_code} - {response.data}")
        return
        
    result = response.data
    print(f"Submission Successful!")
    print(f"Score: {result['score']}% ({result['correct_answers']}/{result['total_questions']})")
    print(f"Status: {result['status']}")

    # 5. List Attempts
    print("\n--- 5. Testing List Attempts ---")
    response = client.get('/api/quiz/attempts/')
    if response.status_code != 200:
        print(f"List Attempts failed: {response.status_code}")
        return
    print(f"Attempts found: {len(response.data)}")

if __name__ == "__main__":
    test_quiz_api()
