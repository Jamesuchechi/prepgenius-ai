import logging
import random
from django.db import transaction
from django.utils import timezone
from apps.quiz.services import QuizService
from apps.quiz.models import Quiz
from apps.study_plans.models import StudyPlan, StudyPlanAssessment
from apps.content.models import Topic

logger = logging.getLogger(__name__)

class PlanAssessmentService:
    """
    Service to generate assessments (Exit Quizzes and Mock Exams) for study plans.
    """

    @staticmethod
    def generate_assessment(study_plan: StudyPlan, assessment_type: str):
        """
        Generates a comprehensive quiz for the study plan.
        assessment_type: exit_quiz or mock_exam
        """
        # 1. Get all unique topics from the study plan
        tasks = study_plan.tasks.select_related('topic', 'subject').all()
        topics = list(set([t.topic for t in tasks]))
        
        if not topics:
            raise ValueError("No topics found in study plan to generate assessment.")

        # 2. Prepare quiz settings
        num_questions = 20 if assessment_type == 'exit_quiz' else 50
        difficulty = study_plan.difficulty_preference.upper()
        
        # We group topics by subject for a balanced exam
        subjects = list(study_plan.subjects.all())
        if not subjects:
            # Fallback to topics' subjects
            subjects = list(set([t.subject for t in tasks]))

        title = f"Exit Quiz: {study_plan.name}" if assessment_type == 'exit_quiz' else f"Mock Exam: {study_plan.name}"
        
        # 3. Use AI to generate questions across topics
        # Since QuizService currently handles one topic at a time, we might take a sample of topics 
        # or combine them into a summary for the prompt.
        
        # For now, let's pick 5-10 key topics and ask AI to generate questions for them
        sample_topics = random.sample(topics, min(10, len(topics)))
        topic_summary = ", ".join([t.name for t in sample_topics])
        
        try:
            # We use the main subject if there's only one, otherwise "General Knowledge"
            main_subject = subjects[0] if len(subjects) == 1 else None
            
            quiz = QuizService.generate_quiz(
                user=study_plan.user,
                subject=main_subject,
                topic=topic_summary,
                difficulty=difficulty,
                question_count=num_questions,
                exam_mode=study_plan.exam_type.name if study_plan.exam_type else None
            )
            
            # Update title
            quiz.title = title
            quiz.save()
            
            # 4. Link to StudyPlanAssessment
            with transaction.atomic():
                assessment = StudyPlanAssessment.objects.create(
                    study_plan=study_plan,
                    quiz=quiz,
                    assessment_type=assessment_type
                )
            
            return quiz, assessment

        except Exception as e:
            logger.error(f"Failed to generate {assessment_type} for plan {study_plan.id}: {e}")
            raise e
