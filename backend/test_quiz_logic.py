import os
import django
import sys
import json

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.quiz.services import QuizService
from apps.questions.models import Question
from apps.content.models import Subject

def test_quiz_generation():
    User = get_user_model()
    try:
        user = User.objects.get(email='test@example.com')
    except User.DoesNotExist:
        print("Test user not found, creating one...")
        user = User.objects.create_user(username='test_quiz', email='test@example.com', password='password123')

    # Create/Get Subject
    try:
        subject = Subject.objects.get(name="General Knowledge")
    except Subject.DoesNotExist:
        subject = Subject.objects.create(
            name="General Knowledge", 
            category="STEM",
            description="General knowledge questions"
        )

    print(f"Generating Quiz for User: {user.username} (Subject: {subject.name})")
    
    try:
        # Generate Quiz
        quiz = QuizService.generate_quiz(
            user=user,
            subject=subject,
            topic="Space Exploration",
            difficulty="EASY",
            question_count=3,
            question_type="MCQ",
            exam_mode=None
        )
        
        print(f"\n✅ Quiz Generated: {quiz.title}")
        print(f"ID: {quiz.id}")
        
        # Verify Questions
        questions = quiz.questions.all()
        print(f"Questions Count: {questions.count()}")
        
        for i, q in enumerate(questions, 1):
            print(f"\nQ{i}: {q.content}")
            print(f"Type: {q.question_type}")
            print("Options:")
            for ans in q.answers.all():
                print(f" - {ans.content} ({'Correct' if ans.is_correct else 'Wrong'})")
                
    except Exception as e:
        print(f"\n❌ Quiz Generation Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_quiz_generation()
