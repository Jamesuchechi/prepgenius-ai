
from apps.exams.models import ExamAttempt, MockExam, ExamResult
from apps.questions.models import Question, Answer
from django.utils import timezone
import logging
import asyncio
from asgiref.sync import async_to_sync
from ai_services.router import AIRouter
from ai_services.prompts import PromptTemplates
from apps.study_tools.services.srs_service import SRSService

logger = logging.getLogger(__name__)

def validate_exam_timer(attempt: ExamAttempt, time_taken_seconds: int = None):
	"""
	Validates if the exam was submitted within allowed time.
	
	Args:
		attempt: ExamAttempt instance
		time_taken_seconds: Total time taken (optional, will use attempt's time if not provided)
	
	Returns:
		dict with 'is_valid', 'remaining_time', 'is_expired' keys
	"""
	allowed_seconds = attempt.mock_exam.duration_minutes * 60
	actual_time = time_taken_seconds if time_taken_seconds is not None else attempt.time_taken_seconds
	
	is_expired = actual_time > allowed_seconds
	remaining = allowed_seconds - actual_time
	
	return {
		'is_valid': not is_expired,
		'remaining_time': max(0, remaining),
		'is_expired': is_expired,
		'actual_time': actual_time,
		'allowed_seconds': allowed_seconds
	}


def auto_grade_exam(attempt: ExamAttempt):
	"""
	Grades the exam attempt based on raw_responses.
	Calculates score, percentage, and detailed breakdown.
	
	Args:
		attempt: ExamAttempt instance to grade
	
	Returns:
		dict with 'score', 'percentage', 'breakdown' keys
	
	Raises:
		ValueError: If exam has no responses or invalid data
	"""
	if not attempt.raw_responses:
		logger.warning(f"Attempt {attempt.id} has no responses")
		return {
			'score': 0,
			'percentage': 0,
			'breakdown': {},
			'attempted_questions': 0
		}
	
	responses = attempt.raw_responses
	total_score = 0
	breakdown = {}
	attempted_questions = 0
	correct_count = 0
	incorrect_count = 0
	unanswered_count = 0
	
	try:
		# Bulk fetch questions with optimizations
		mock_questions = attempt.mock_exam.mockexamquestion_set.select_related(
			'question', 'question__topic'
		).all()
		
		# Get all question IDs
		question_ids = [mq.question.id for mq in mock_questions]
		
		# Bulk fetch all correct answers
		correct_answers = Answer.objects.filter(
			question_id__in=question_ids,
			is_correct=True
		).select_related('question')
		
		# Map question_id -> correct_answer
		correct_answer_map = {
			str(a.question.id): a for a in correct_answers
		}
		
		for mq in mock_questions:
			qid = str(mq.question.id)
			question = mq.question
			
			# Get user's answer
			user_answer_id = responses.get(qid)
			
			# Handle Theory/Essay questions
			if question.question_type in ['THEORY', 'ESSAY', 'THEORY', 'essay']:
				if not user_answer_id:
					unanswered_count += 1
					breakdown[qid] = {
						'question_id': qid,
						'question_text': question.content[:100],
						'topic': question.topic.name if question.topic else None,
						'difficulty': question.difficulty,
						'user_answer_text': None,
						'is_correct': False,
						'explanation': question.guidance or "No model answer available."
					}
					continue

				attempted_questions += 1
				
				# We'll collect these for AI grading after the loop or grade here
				# For efficiency, let's just use the router here (using async_to_sync)
				try:
					ai = AIRouter()
					
					# Call dedicated theory grading method
					ai_response = async_to_sync(ai.grade_theory_question_async)(
						question_text=question.content,
						user_answer=user_answer_id,
						model_answer=question.guidance or "Model answer provided in detailed review.",
						subject=attempt.mock_exam.subject.name,
						exam_type=attempt.mock_exam.exam_type.name
					)
					
					ai_score = ai_response.get('score', 0)
					ai_feedback = ai_response.get('feedback', {})
					
					# Normalize score to 1.0 max (if 0-10)
					normalized_score = float(ai_score) / 10.0
					total_score += normalized_score
					
					is_graded_correct = normalized_score >= 0.5
					if is_graded_correct:
						correct_count += 1
					else:
						incorrect_count += 1

					breakdown[qid] = {
						'question_id': question.id,
						'question_text': question.content[:100],
						'topic': question.topic.name if question.topic else None,
						'difficulty': question.difficulty,
						'user_answer_text': user_answer_id,
						'is_correct': is_graded_correct,
						'score': ai_score,
						'critique': ai_feedback.get('critique'),
						'accuracy': ai_feedback.get('accuracy'),
						'completeness': ai_feedback.get('completeness'),
						'clarity': ai_feedback.get('clarity'),
						'improvement_tips': ai_response.get('improvement_tips', []),
						'explanation': question.guidance or "Model answer provided in detailed review."
					}
				except Exception as ai_err:
					logger.error(f"AI grading failed for question {qid}: {ai_err}")
					# Fallback to manual/pending
					breakdown[qid] = {
						'question_id': question.id,
						'question_text': question.content[:100],
						'topic': question.topic.name if question.topic else None,
						'difficulty': question.difficulty,
						'user_answer_text': user_answer_id,
						'is_correct': None, # Pending
						'explanation': question.guidance or "Model answer provided in detailed review."
					}
				continue

			# Get correct answer from map
			correct_answer = correct_answer_map.get(qid)
			
			# Determine if answer is correct
			is_correct = False
			if user_answer_id and correct_answer:
				is_correct = str(correct_answer.id) == str(user_answer_id)
			
			# Record attempt
			if user_answer_id:
				attempted_questions += 1
				if is_correct:
					correct_count += 1
					total_score += 1
				else:
					incorrect_count += 1
					SRSService.auto_generate_from_mistake(attempt.user, type('obj', (object,), {'is_correct': False, 'question': question}))
			else:
				unanswered_count += 1
			
			# Add to breakdown
			breakdown[qid] = {
				'question_id': question.id,
				'question_text': question.content[:100],
				'topic': question.topic.name if question.topic else None,
				'difficulty': question.difficulty,
				'user_answer_id': user_answer_id,
				'correct_answer_id': correct_answer.id if correct_answer else None,
				'correct_answer_text': correct_answer.content if correct_answer else None,
				'is_correct': is_correct,
				'explanation': correct_answer.explanation if correct_answer else None
			}
	except Exception as e:
		logger.error(f"Error grading attempt {attempt.id}: {str(e)}")
		raise ValueError(f"Error during grading: {str(e)}")
	
	# Calculate percentage
	total_questions = len(mock_questions)
	percentage = (total_score / total_questions * 100) if total_questions > 0 else 0
	
	# Update attempt
	attempt.score = total_score
	attempt.percentage = percentage
	attempt.attempted_questions = attempted_questions
	attempt.auto_graded = True
	attempt.status = 'GRADED'
	attempt.save()
	
	logger.info(
		f"Graded attempt {attempt.id}: "
		f"Score: {total_score}/{total_questions} ({percentage:.1f}%), "
		f"Attempted: {attempted_questions}, Correct: {correct_count}, "
		f"Incorrect: {incorrect_count}, Unanswered: {unanswered_count}"
	)
	
	return {
		'score': total_score,
		'percentage': percentage,
		'breakdown': breakdown,
		'attempted_questions': attempted_questions,
		'correct_count': correct_count,
		'incorrect_count': incorrect_count,
		'unanswered_count': unanswered_count
	}


def validate_exam_submission(attempt: ExamAttempt, time_taken_seconds: int):
	"""
	Validates the exam submission (timer and responses).
	
	Args:
		attempt: ExamAttempt instance
		time_taken_seconds: Time taken for the exam
	
	Returns:
		dict with validation results
	"""
	# Validate timer
	timer_validation = validate_exam_timer(attempt, time_taken_seconds)
	
	# Check if exam has responses
	has_responses = bool(attempt.raw_responses)
	
	# Check attempted questions
	attempted_count = sum(1 for v in attempt.raw_responses.values() if v)
	total_questions = attempt.mock_exam.mockexamquestion_set.count()
	
	return {
		'timer_valid': timer_validation['is_valid'],
		'timer_expired': timer_validation['is_expired'],
		'remaining_time': timer_validation['remaining_time'],
		'has_responses': has_responses,
		'attempted_questions': attempted_count,
		'total_questions': total_questions,
		'attempted_percentage': (attempted_count / total_questions * 100) if total_questions > 0 else 0
	}
