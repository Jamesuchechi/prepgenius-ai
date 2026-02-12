
from apps.exams.models import ExamAttempt, ExamResult
from apps.content.models import Topic
from apps.questions.models import Question
import logging
from ai_services.router import AIRouter
from apps.questions.models import Answer

logger = logging.getLogger(__name__)

def analyze_exam_result(attempt: ExamAttempt, grading_result: dict):
	"""
	Generates comprehensive analytics for a completed exam attempt.
	
	Args:
		attempt: ExamAttempt instance
		grading_result: Result dict from auto_grade_exam()
	
	Returns:
		ExamResult instance
	"""
	breakdown = grading_result.get('breakdown', {})
	total_score = grading_result.get('score', 0)
	percentage = grading_result.get('percentage', 0)
	correct_count = grading_result.get('correct_count', 0)
	incorrect_count = grading_result.get('incorrect_count', 0)
	unanswered_count = grading_result.get('unanswered_count', 0)
	
	num_questions = attempt.mock_exam.mockexamquestion_set.count()
	passing_score = attempt.mock_exam.passing_score or 40
	passed = percentage >= passing_score
	
	# Per-topic analysis
	topic_stats = {}
	topic_performance = {}
	
	try:
		ai = AIRouter()
		for mq in attempt.mock_exam.mockexamquestion_set.all():
			q = mq.question
			topic = q.topic.name if q.topic else "Uncategorized"
			difficulty = q.difficulty
			
			if topic not in topic_stats:
				topic_stats[topic] = {
					"correct": 0,
					"total": 0,
					"by_difficulty": {
						"EASY": {"correct": 0, "total": 0},
						"MEDIUM": {"correct": 0, "total": 0},
						"HARD": {"correct": 0, "total": 0}
					}
				}
				topic_performance[topic] = {
					"mastery_level": 0,  # 0-100%
					"time_efficiency": 0,
					"status": "weak"  # weak, average, strong
				}
			
			qid = str(q.id)
			question_data = breakdown.get(qid, {})
			is_correct = question_data.get('is_correct', False)
			# Ensure each question has an educative explanation. Use stored answer explanation first,
			# otherwise ask the AI to generate an explanation/correction.
			explanation = question_data.get('explanation')
			if not explanation:
				# attempt to use stored correct answer explanation
				correct_ans_id = question_data.get('correct_answer_id')
				if correct_ans_id:
					ans = Answer.objects.filter(id=correct_ans_id).first()
					if ans and ans.explanation:
						explanation = ans.explanation
				# If still missing, call AI to explain
				if not explanation:
					try:
						# Build context for AI explanation
						options = []
						if hasattr(q, 'answers'):
							options = [a.content for a in q.answers.all()]
						ai_response = ai.generate_questions(
							topic=q.topic.name if q.topic else q.subject.name,
							difficulty=q.difficulty or 'MEDIUM',
							count=1,
							q_type='EXPLAIN',
							additional_context=f"QUESTION: {q.content}\nOPTIONS: {options}\nUSER_ANSWER_ID: {question_data.get('user_answer_id')}\nCORRECT_ANSWER_ID: {question_data.get('correct_answer_id')}"
						)
						# normalize AI response
						items = ai_response.get('questions', ai_response) if isinstance(ai_response, dict) else ai_response
						if isinstance(items, list) and len(items) > 0:
							item = items[0]
							explanation = item.get('explanation') or item.get('step_by_step') or item.get('correction')
					except Exception as e:
						logger.warning(f"AI explanation failed for question {q.id}: {e}")
			# attach explanation back into breakdown
			if explanation:
				question_data['explanation'] = explanation
			breakdown[qid] = question_data
			
			topic_stats[topic]["total"] += 1
			if difficulty:
				topic_stats[topic]["by_difficulty"][difficulty]["total"] += 1
			
			if is_correct:
				topic_stats[topic]["correct"] += 1
				if difficulty:
					topic_stats[topic]["by_difficulty"][difficulty]["correct"] += 1
		
		# Calculate topic mastery levels
		for topic, stats in topic_stats.items():
			total = stats['total']
			correct = stats['correct']
			if total > 0:
				mastery = (correct / total) * 100
				topic_performance[topic]['mastery_level'] = round(mastery, 1)
				
				# Determine status
				if mastery >= 80:
					topic_performance[topic]['status'] = 'strong'
				elif mastery >= 60:
					topic_performance[topic]['status'] = 'average'
				else:
					topic_performance[topic]['status'] = 'weak'
	
	except Exception as e:
		logger.error(f"Error analyzing results for attempt {attempt.id}: {str(e)}")
		topic_stats = {}
		topic_performance = {}
	
	# Generate recommendations
	recommendations = generate_recommendations(topic_performance, percentage)
	
	# Create or update result
	detailed_breakdown = {
		"topics": topic_stats,
		"questions": breakdown,
		"summary": {
			"correct": correct_count,
			"incorrect": incorrect_count,
			"unanswered": unanswered_count,
			"total": num_questions
		}
	}
	
	result, created = ExamResult.objects.get_or_create(
		attempt=attempt,
		defaults={
			"total_score": total_score,
			"percentage": percentage,
			"passed": passed,
			"correct_answers": correct_count,
			"incorrect_answers": incorrect_count,
			"unanswered": unanswered_count,
			"detailed_breakdown": detailed_breakdown,
			"performance_summary": topic_performance,
			"recommendations": recommendations
		}
	)
	
	if not created:
		result.total_score = total_score
		result.percentage = percentage
		result.passed = passed
		result.correct_answers = correct_count
		result.incorrect_answers = incorrect_count
		result.unanswered = unanswered_count
		result.detailed_breakdown = detailed_breakdown
		result.performance_summary = topic_performance
		result.recommendations = recommendations
		result.save()
	
	logger.info(
		f"Analyzed result for attempt {attempt.id}: "
		f"Percentage: {percentage:.1f}%, Passed: {passed}, "
		f"Topics analyzed: {len(topic_stats)}"
	)
	
	return result


def generate_recommendations(topic_performance: dict, overall_percentage: float) -> list:
	"""
	Generate AI-based recommendations for improvement.
	
	Args:
		topic_performance: Dict of topic performance data
		overall_percentage: Overall exam percentage
	
	Returns:
		List of recommendation strings
	"""
	recommendations = []
	
	if overall_percentage < 40:
		recommendations.append(
			"You need to focus more on exam preparation. "
			"Review all topics systematically and practice more questions."
		)
	elif overall_percentage < 60:
		recommendations.append(
			"Your performance is below average. "
			"Focus on weak topics and practice regularly."
		)
	elif overall_percentage < 75:
		recommendations.append(
			"Good effort! Keep practicing to improve your scores further."
		)
	else:
		recommendations.append(
			"Excellent performance! Continue this level of preparation."
		)
	
	# Topic-specific recommendations
	weak_topics = [
		topic for topic, perf in topic_performance.items()
		if perf.get('status') == 'weak'
	]
	
	if weak_topics:
		recommendations.append(
			f"Focus on these weak areas: {', '.join(weak_topics[:3])}. "
			"Consider taking targeted practice tests."
		)
	
	strong_topics = [
		topic for topic, perf in topic_performance.items()
		if perf.get('status') == 'strong'
	]
	
	if strong_topics:
		recommendations.append(
			f"Great mastery in: {', '.join(strong_topics)}. "
			"Keep practicing to maintain these strong areas."
		)
	
	# Difficulty-specific recommendation
	if overall_percentage < 70:
		recommendations.append(
			"Start with easier questions to build confidence, "
			"then gradually tackle harder topics."
		)
	
	return recommendations


def get_exam_statistics(mock_exam):
	"""
	Get overall statistics for a mock exam across all attempts.
	
	Args:
		mock_exam: MockExam instance
	
	Returns:
		dict with statistics
	"""
	from django.db.models import Avg, Max, Min, Count
	
	attempts = mock_exam.examinattempt_set.filter(
		is_submitted=True,
		auto_graded=True
	)
	
	stats = attempts.aggregate(
		total_attempts=Count('id'),
		avg_score=Avg('score'),
		avg_percentage=Avg('percentage'),
		max_score=Max('score'),
		min_score=Min('score'),
		avg_time=Avg('time_taken_seconds')
	)
	
	# Count passed vs failed
	passed_count = attempts.filter(percentage__gte=mock_exam.passing_score or 40).count()
	failed_count = attempts.count() - passed_count
	
	stats['passed_count'] = passed_count
	stats['failed_count'] = failed_count
	stats['pass_rate'] = (
		(passed_count / attempts.count() * 100)
		if attempts.count() > 0 else 0
	)
	
	return stats
