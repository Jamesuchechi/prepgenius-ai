import logging
from typing import List
from ai_services.router import AIRouter
from ..models import Question, Answer
from apps.content.models import Subject, Topic, ExamType

logger = logging.getLogger(__name__)

class QuestionGenerationService:
    def __init__(self):
        self.ai_router = AIRouter()

    def generate_questions(self, subject_id: int, topic_id: int, exam_type_id: int, 
                          difficulty: str = "MEDIUM", count: int = 5, question_type: str = "MCQ") -> List[Question]:
        
        subject = Subject.objects.get(id=subject_id)
        topic = Topic.objects.get(id=topic_id)
        
        exam_type = None
        if exam_type_id and int(exam_type_id) > 0:
             exam_type = ExamType.objects.filter(id=exam_type_id).first()
        
        exam_name = exam_type.name if exam_type else "General"
        context = f"Exam Type: {exam_name}. Subject: {subject.name}. Target Audience: Nigerian students."
        
        try:
            generated_data = self.ai_router.generate_questions(
                topic=topic.name,
                difficulty=difficulty,
                count=count,
                q_type=question_type,
                additional_context=context
            )
            
            created_questions = []
            
            # Handle potential wrapper keys like 'questions' or direct list
            items = generated_data.get('questions', generated_data) if isinstance(generated_data, dict) else generated_data
            
            if not isinstance(items, list):
                logger.error(f"Unexpected data format from AI: {items}")
                raise ValueError("AI response format error: expected list of questions")

            for q_data in items:
                question = self._create_question_from_data(q_data, subject, topic, exam_type, difficulty, question_type)
                created_questions.append(question)
                
            return created_questions
            
        except Exception as e:
            logger.error(f"Question generation failed: {e}")
            raise

    def _create_question_from_data(self, data, subject, topic, exam_type, difficulty, q_type):
        question = Question.objects.create(
            subject=subject,
            topic=topic,
            exam_type=exam_type,
            content=data.get('content', 'No content provided'),
            question_type=q_type,
            difficulty=difficulty,
            guidance=data.get('guidance') or data.get('explanation', ''),
            metadata=data.get('metadata', {})
        )

        if q_type == 'MCQ':
            self._create_mcq_answers(question, data)
        elif q_type == 'THEORY':
             self._create_theory_answer(question, data)
        elif q_type == 'TRUE_FALSE':
            self._create_true_false_answer(question, data)
        elif q_type == 'FILL_BLANK':
            self._create_simple_answer(question, data)
        elif q_type == 'MATCHING':
             pass # Matching often logic handled via metadata in Question, answers might not be needed in standard way or handled differently
        elif q_type == 'ORDERING':
             pass # Ordering sequence stored in metadata
             
        return question

    def _create_mcq_answers(self, question, data):
        options = data.get('options', [])
        correct = data.get('correct_answer')
        correct_idx = data.get('correct_answer_index')
        explanation = data.get('explanation', '')
        
        for idx, option in enumerate(options):
            is_correct = False
            
            # 1. Primary check: correct_answer_index
            if correct_idx is not None:
                try:
                    is_correct = (idx == int(correct_idx))
                except (ValueError, TypeError):
                    pass
            
            # 2. Secondary check: correct_answer (string or index)
            if not is_correct and correct is not None:
                if isinstance(correct, int) and 0 <= correct < len(options):
                    is_correct = (idx == correct)
                elif isinstance(correct, str):
                    norm_option = str(option).strip().lower()
                    norm_correct = str(correct).strip().lower()
                    is_correct = (norm_option == norm_correct)
                    if not is_correct and len(norm_correct) > 3:
                        if norm_correct in norm_option:
                            is_correct = True

            Answer.objects.create(
                question=question,
                content=option,
                is_correct=is_correct,
                explanation=explanation if is_correct else "" 
            )

    def _create_theory_answer(self, question, data):
        Answer.objects.create(
            question=question,
            content=data.get('answer', ''),
            is_correct=True,
            explanation=data.get('explanation', '')
        )

    def _create_true_false_answer(self, question, data):
        correct = str(data.get('correct_answer', 'True')).lower() == 'true'
        explanation = data.get('explanation', '')
        
        Answer.objects.create(question=question, content="True", is_correct=correct, explanation=explanation if correct else "")
        Answer.objects.create(question=question, content="False", is_correct=not correct, explanation=explanation if not correct else "")

    def _create_simple_answer(self, question, data):
        Answer.objects.create(
            question=question,
            content=data.get('correct_answer', ''),
            is_correct=True,
            explanation=data.get('explanation', '')
        )
