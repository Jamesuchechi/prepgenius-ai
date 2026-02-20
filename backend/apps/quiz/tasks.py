from apps.quiz.services import QuizService
from django.contrib.auth import get_user_model
from apps.content.models import Subject
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

def generate_quiz_async(user_id, subject_id, topic, difficulty, question_count, question_type, document_id=None):
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        subject_obj = Subject.objects.get(id=subject_id) if subject_id else None

        quiz = QuizService.generate_quiz(
            user=user,
            subject=subject_obj, 
            topic=topic,
            difficulty=difficulty,
            question_count=question_count,
            question_type=question_type, 
            document_id=document_id
        )
        return {"status": "success", "quiz_id": quiz.id}
    except Exception as e:
        logger.error(f"Quiz Generation Task failed: {e}")
        return {"status": "failed", "error": str(e)}
