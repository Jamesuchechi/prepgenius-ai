import logging
import json
from django.db import transaction
from apps.questions.models import Question, Answer
from apps.quiz.models import Quiz
from apps.study_tools.models import Document
from ai_services.router import AIRouter

logger = logging.getLogger(__name__)

class QuizService:
    @staticmethod
    def generate_quiz(user, subject, topic, difficulty, question_count=5, question_type="MCQ", exam_mode=None, document_id=None):
        """
        Generates a quiz using AI.
        question_type: MCQ, THEORY
        exam_mode: JAMB, WAEC (String name of ExamType)
        """
        router = AIRouter()
        additional_context = ""
        source_document = None
        exam_type_obj = None

        # Resolve ExamType if provided
        if exam_mode:
            from apps.content.models import ExamType
            try:
                exam_type_obj = ExamType.objects.get(name__iexact=exam_mode)
            except ExamType.DoesNotExist:
                logger.warning(f"ExamType '{exam_mode}' not found.")

        # Handle RAG context
        if document_id:
            try:
                # Use RAG to get relevant context for the whole document (summary or chunks)
                # Since quiz questions cover the whole doc, we might want a summary or just use the content field directly if small.
                # But to consistent with "RAG", let's use the router method which handles fallback.
                # We can query for "key concepts" to get good chunks.
                additional_context = router._get_document_context(document_id, f"key concepts in {topic}", k=5)
            except Exception as e:
                logger.error(f"Error reading document context for quiz: {e}")

        # Call AI Router
        try:
            # Expected format from AI: List of dicts
            ai_response = router.generate_questions(
                topic=topic,
                difficulty=difficulty,
                count=question_count,
                q_type=question_type,
                additional_context=additional_context
            )
            
            # Parse response if it's a string (sometimes AI returns stringified JSON)
            if isinstance(ai_response, str):
                try:
                    questions_data = json.loads(ai_response)
                except json.JSONDecodeError:
                    # AI might have returned text with Markdown code blocks
                    import re
                    match = re.search(r'```json\n(.*?)\n```', ai_response, re.DOTALL)
                    if match:
                        questions_data = json.loads(match.group(1))
                    else:
                        raise ValueError("AI response is not valid JSON")
            else:
                questions_data = ai_response

            if not isinstance(questions_data, list):
                 # Handle case where AI returns {"questions": [...]}
                 if isinstance(questions_data, dict) and "questions" in questions_data:
                     questions_data = questions_data["questions"]
                 else:
                    raise ValueError("AI response format invalid (expected list or dict with 'questions' key)")

        except Exception as e:
            logger.error(f"Failed to generate quiz questions: {e}")
            raise e

        # Save to DB
        with transaction.atomic():
            # Create Quiz
            # Resolve Subject if None
            final_subject = subject
            if not final_subject:
                # Try to get or create General subject
                 from apps.content.models import Subject
                 try:
                     final_subject = Subject.objects.get(name="General Knowledge")
                 except Subject.DoesNotExist:
                     # Create if missing (though unlikely in prod without migrations)
                     final_subject = Subject.objects.create(name="General Knowledge", category="STEM", description="General")

            quiz = Quiz.objects.create(
                created_by=user,
                title=f"Quiz: {topic} ({difficulty})",
                subject=final_subject if hasattr(final_subject, 'id') else None,
                topic=topic,
                difficulty=difficulty,
                exam_type=exam_type_obj, 
                source_document=source_document
            )

            for q_data in questions_data:
                # Create Question
                question = Question.objects.create(
                    subject=final_subject if hasattr(final_subject, 'id') else None,
                    
                    content=q_data.get("question") or q_data.get("content"),
                    question_type=question_type,
                    difficulty=difficulty,
                    guidance=q_data.get("explanation", "")
                )
                
                # Create Answers
                options = q_data.get("options", [])
                correct_ans = q_data.get("correct_answer") or q_data.get("answer")
                
                # Handle MCQ
                if question_type == "MCQ":
                    # If options is list: ["A. Option", "B. Option"] or just ["Option 1", "Option 2"]
                    # We need standardizing.
                    pass # Simplified logic for now
                    
                    for opt in options:
                        is_correct = False
                        # Check if this option matches correct answer
                        # AI usually returns "A" or "Option 1"
                        if correct_ans and (str(correct_ans) in str(opt) or str(opt).startswith(str(correct_ans))):
                            is_correct = True
                        
                        Answer.objects.create(
                            question=question,
                            content=opt,
                            is_correct=is_correct,
                            explanation=q_data.get("explanation", "") if is_correct else ""
                        )
                
                quiz.questions.add(question)
            
            return quiz
