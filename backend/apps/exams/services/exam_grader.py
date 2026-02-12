
from apps.exams.models import ExamAttempt, MockExam, ExamResult
from apps.questions.models import Question, Answer
from django.utils import timezone
import logging

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
		for mq in attempt.mock_exam.mockexamquestion_set.all():
			qid = str(mq.question.id)
			question = mq.question
			
			# Get user's answer
			user_answer_id = responses.get(qid)
			
			# Handle Theory/Essay questions
			if question.question_type == 'THEORY' or question.question_type == 'ESSAY':
				if user_answer_id:
					attempted_questions += 1
				
				# For now, we don't auto-grade theory questions. 
				# We mark them as None for correctness.
				breakdown[qid] = {
					'question_id': question.id,
					'question_text': question.content[:100],
					'topic': question.topic.name if question.topic else None,
					'difficulty': question.difficulty,
					'user_answer_text': user_answer_id,
					'is_correct': None, # Pending grading
					'explanation': question.guidance or "Model answer provided in detailed review."
				}
				continue

			# Get correct answer
			correct_answer = Answer.objects.filter(
				question=question,
				is_correct=True
			).first()
			
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
	total_questions = attempt.mock_exam.mockexamquestion_set.count()
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
