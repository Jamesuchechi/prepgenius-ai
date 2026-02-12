
from apps.questions.models import Question
from apps.exams.models import MockExam, MockExamQuestion
from apps.content.models import Subject, ExamType
import random
import logging
from ai_services.router import AIRouter
from apps.questions.models import Answer, Topic
from apps.content.models import ExamBoard, ExamType, Country
from django.db import transaction
from django.utils.text import slugify
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

def generate_jamb_mock_exam(
	subject_id, 
	exam_type_id, 
	num_questions=60, 
	duration_minutes=60, 
	creator=None,
	difficulty_distribution=None
):
	"""
	Generate a JAMB mock exam by subject and exam type IDs.
	"""
	pass


def generate_mock_exam_by_subject_name(
	subject_name,
	exam_format=None,
	num_questions=60,
	duration_minutes=60,
	creator=None,
	difficulty='MEDIUM',
	difficulty_distribution=None,
	year: int = None,
	force_ai: bool = False,
	mode: str = 'ai_generated'
):
	"""
	Generate a mock exam with two modes:
	
	MODE 1: 'past_questions'
	  - Fetches actual past exam questions for a given subject and year
	  - Strategy: DB (cache) -> ALOC API -> (optional) AI fallback
	  - Caches all fetched questions for future reuse
	  
	MODE 2: 'ai_generated' (default)
	  - Generates new questions using AI with specified format and difficulty
	  - Uses format-specific defaults for duration, passing score, etc.
	  - Strategy: DB (cache) -> AI generation
	  
	All questions fetched/generated are saved to DB, so subsequent requests reuse cached data.
	"""
	ai = AIRouter()

	# Normalize inputs
	mode = mode or 'ai_generated'
	
	# Find or create subject
	subject = Subject.objects.filter(name__iexact=subject_name).first()
	if not subject:
		subject = Subject.objects.create(
			name=subject_name,
			category='VOCATIONAL',
			description=f'Auto-created subject for {subject_name}',
			aliases=[subject_name]
		)

	# ================== PAST QUESTIONS MODE ==================
	if mode == 'past_questions':
		if not year:
			raise ValueError('year is required for past_questions mode')
		if not exam_format:
			raise ValueError('exam_format is required for past_questions mode')
		
		# Default to 60 questions and 120 minutes for past exams
		num_questions = num_questions or 60
		duration_minutes = duration_minutes or 120
		
		# Create or get ExamType/ExamBoard for the format
		exam_type = ExamType.objects.filter(name__icontains=exam_format).first()
		if not exam_type:
			format_country_map = {
				'JAMB': {'code': 'NG', 'country': 'Nigeria', 'board': 'JAMB', 'region': 'Africa', 'currency': 'NGN'},
				'WAEC': {'code': 'NG', 'country': 'Nigeria', 'board': 'WAEC', 'region': 'Africa', 'currency': 'NGN'},
				'NABTEB': {'code': 'NG', 'country': 'Nigeria', 'board': 'NABTEB', 'region': 'Africa', 'currency': 'NGN'},
				'NECO': {'code': 'NG', 'country': 'Nigeria', 'board': 'NECO', 'region': 'Africa', 'currency': 'NGN'},
				'IGCSE': {'code': 'GB', 'country': 'United Kingdom', 'board': 'Cambridge', 'region': 'Europe', 'currency': 'GBP'},
				'SAT': {'code': 'US', 'country': 'United States', 'board': 'College Board', 'region': 'Americas', 'currency': 'USD'},
				'OTHER': {'code': 'XX', 'country': 'International', 'board': exam_format.upper(), 'region': 'Global', 'currency': 'USD'},
			}
			key = exam_format.upper()
			mapped = format_country_map.get(key, format_country_map['OTHER'])

			country, _ = Country.objects.get_or_create(
				code=mapped['code'],
				defaults={'name': mapped['country'], 'region': mapped['region'], 'currency': mapped['currency']}
			)

			board, _ = ExamBoard.objects.get_or_create(
				name=mapped['board'],
				defaults={'full_name': f"{mapped['board']} Board", 'country': country, 'is_international': (mapped['code'] == 'XX')}
			)

			exam_type = ExamType.objects.create(
				name=exam_format.upper(),
				full_name=f"{exam_format.upper()} Past Exam",
				exam_board=board,
				level='SENIOR',
				duration_minutes=duration_minutes,
				passing_score=int(0.4 * num_questions),
				max_score=num_questions,
				description=f"Past exam questions from {exam_format} ({year})",
				exam_format={"format": exam_format},
			)
		
		# Step 1: Check DB cache for past questions from this year and exam board
		selected_questions = []
		db_questions = Question.objects.filter(
			subject=subject,
			question_type='MCQ',
			exam_type=exam_type,
			metadata__year=year
		)
		available = db_questions.count()
		
		if available >= num_questions:
			# Enough cached questions
			selected_questions = random.sample(list(db_questions), num_questions)
		else:
			# Use whatever cached questions exist first
			if available > 0:
				selected_questions = list(db_questions)
			
			remaining = num_questions - len(selected_questions)
			
			# Step 2: Try ALOC API for past exam questions
			try:
				base = getattr(settings, 'ALOC_BASE_URL', None)
				token = getattr(settings, 'ALOC_ACCESS_TOKEN', None)
				
				if base and token and remaining > 0:
					# Convert exam format to ALOC type parameter
					aloc_type = exam_format.lower() if exam_format else None
					# Convert subject name to lowercase
					aloc_subject = subject.name.lower() if subject.name else None
					
					params = {
						'subject': aloc_subject,
					}
					if aloc_type:
						params['type'] = aloc_type
					if year:
						params['year'] = str(year)
					
					# ALOC uses AccessToken header, not Authorization
					headers = {'AccessToken': token}
					logger.debug(f"Calling ALOC API with params: {params}")
					resp = requests.get(f"{base.rstrip('/')}/q", params=params, headers=headers, timeout=10)
					logger.debug(f"ALOC API status: {resp.status_code}")
					
					if resp.status_code == 200:
						data = resp.json()
						items = data if isinstance(data, list) else data.get('results', [])
						
						if items:
							logger.info(f"ALOC API returned {len(items)} questions for {subject.name} ({year})")
							
							# Ensure a topic exists
							topic = Topic.objects.filter(subject=subject).first()
							if not topic:
								topic = Topic.objects.create(
									subject=subject,
									name='General',
									difficulty='BEGINNER',
									order=0,
									estimated_hours=1.0,
									description='Auto-generated topic',
									learning_objectives=[]
								)
							
							# Map and cache ALOC questions
							for aloc_q in items:
								q_text = aloc_q.get('question') or aloc_q.get('content')
								if not q_text:
									continue
								
								q_meta = {'source': 'ALOC', 'year': year}
								
								question_obj, created = Question.objects.get_or_create(
									content=q_text,
									subject=subject,
									defaults={
										'topic': topic,
										'question_type': 'MCQ',
										'difficulty': aloc_q.get('difficulty', 'MEDIUM'),
										'guidance': aloc_q.get('explanation', '') or '',
										'metadata': q_meta
									}
								)
								
								# Create answers if they don't exist
								if created:
									options = [aloc_q.get('option_a'), aloc_q.get('option_b'), aloc_q.get('option_c'), aloc_q.get('option_d')]
									options = [o for o in options if o]
									correct = aloc_q.get('answer')
									
									for opt in options:
										is_correct = False
										if correct and str(correct).strip():
											is_correct = (opt.strip() == str(correct).strip())
										Answer.objects.create(
											question=question_obj,
											content=opt,
											is_correct=is_correct,
											explanation=(aloc_q.get('explanation') if is_correct else '')
										)
								
								selected_questions.append(question_obj)
					else:
						logger.warning(f"ALOC API returned status {resp.status_code}. Response text: {resp.text[:500] if hasattr(resp, 'text') else 'N/A'}. Data may not be available for {subject.name}/{exam_format}/{year}.")
				else:
					logger.warning(f"ALOC not configured or insufficient remaining: base={bool(base)}, token={bool(token)}, remaining={remaining}")
							
			except Exception as e:
				logger.warning(f"ALOC API error (will try with cached questions): {e}")
		
		# If still not enough questions, try AI as fallback (only for AI generated mode)
		if len(selected_questions) < num_questions:
			logger.warning(f"Only found {len(selected_questions)} questions for {subject.name} ({exam_format}, {year}), requested {num_questions}")
			
			# For past_questions mode: fail if no questions found
			if mode == 'past_questions' and len(selected_questions) == 0:
				raise ValueError(f'No past exam questions found for {subject.name} ({exam_format}, {year}). Please try a different year or exam format.')
			
			# For AI generated mode: allow fallback
			if len(selected_questions) == 0 and mode != 'past_questions':
				logger.info(f"No past questions found. Falling back to AI generation for {subject.name} ({exam_format})")
				remaining = num_questions
				try:
					generated = ai.generate_questions(
						topic=subject.name,
						difficulty=difficulty,
						count=remaining,
						q_type='MCQ',
						additional_context=f"Based on {exam_format} past exam style"
					)
					items = generated.get('questions', generated) if isinstance(generated, dict) else generated
					if not isinstance(items, list):
						raise ValueError('AI returned unexpected format for questions')

					topic = Topic.objects.filter(subject=subject).first()
					if not topic:
						topic = Topic.objects.create(
							subject=subject,
							name='General',
							difficulty='BEGINNER',
							order=0,
							estimated_hours=1.0,
							description='Auto-generated topic',
							learning_objectives=[]
						)

					for q_data in items:
						q = Question.objects.create(
							subject=subject,
							topic=topic,
							exam_type=exam_type,
							content=q_data.get('content', 'No content provided'),
							question_type=q_data.get('type', 'MCQ'),
							difficulty=q_data.get('difficulty', difficulty),
							guidance=q_data.get('explanation', ''),
							metadata={'source': 'AI', 'fallback_from_past_questions': True, 'year': year},
						)

						if q.question_type == 'MCQ':
							options = q_data.get('options', [])
							correct = q_data.get('correct_answer')
							for opt in options:
								is_correct = False
								try:
									if isinstance(correct, int):
										is_correct = (options.index(opt) == int(correct))
								except Exception:
									is_correct = False
								if isinstance(correct, str):
									is_correct = (opt.strip() == correct.strip())
								Answer.objects.create(
									question=q,
									content=opt,
									is_correct=is_correct,
									explanation=(q_data.get('explanation') if is_correct else '')
								)

						selected_questions.append(q)
				except Exception as e:
					logger.error(f"AI fallback generation failed: {e}")
					raise ValueError(f'Could not find past questions for {subject.name} ({year}) and AI generation failed. Please try a different year or use a different exam format.')
			else:
				# Use whatever questions we have (partial results are better than nothing)
				logger.info(f"Using {len(selected_questions)} questions (less than requested {num_questions})")
				num_questions = len(selected_questions)
		
		# Shuffle and trim
		random.shuffle(selected_questions)
		selected_questions = selected_questions[:num_questions]
		
		# Create MockExam for past questions
		with transaction.atomic():
			exam_title = f"{exam_format} Past Exam - {subject.name} ({year})"
			pass_score = int(0.4 * num_questions)  # Passing score for past exams
			
			mock_exam = MockExam.objects.create(
				title=exam_title,
				description=f"Past exam questions for {subject.name} from {year} ({exam_format})",
				exam_type=exam_type,
				subject=subject,
				creator=creator,
				duration_minutes=duration_minutes,
				total_marks=num_questions,
				passing_score=pass_score
			)
			
			for idx, question in enumerate(selected_questions):
				MockExamQuestion.objects.create(mock_exam=mock_exam, question=question, order=idx + 1)
		
		logger.info(f"Created past exam {mock_exam.id} with {len(selected_questions)} questions from {year} for {subject.name}")
		return mock_exam
	
	# ================== AI GENERATED MODE (default) ==================
	
	format_key = (exam_format or '').upper() if exam_format else None
	use_ai = force_ai or (format_key and format_key.startswith('AI'))

	# Resolve or create ExamType/ExamBoard for known formats
	exam_type = None
	if exam_format and not use_ai:
		exam_type = ExamType.objects.filter(name__icontains=exam_format).first()
		if not exam_type:
			# Map formats to country/board defaults
			format_country_map = {
				'JAMB': {'code': 'NG', 'country': 'Nigeria', 'board': 'JAMB', 'region': 'Africa', 'currency': 'NGN'},
				'WAEC': {'code': 'NG', 'country': 'Nigeria', 'board': 'WAEC', 'region': 'Africa', 'currency': 'NGN'},
				'NABTEB': {'code': 'NG', 'country': 'Nigeria', 'board': 'NABTEB', 'region': 'Africa', 'currency': 'NGN'},
				'NECO': {'code': 'NG', 'country': 'Nigeria', 'board': 'NECO', 'region': 'Africa', 'currency': 'NGN'},
				'IGCSE': {'code': 'GB', 'country': 'United Kingdom', 'board': 'Cambridge', 'region': 'Europe', 'currency': 'GBP'},
				'SAT': {'code': 'US', 'country': 'United States', 'board': 'College Board', 'region': 'Americas', 'currency': 'USD'},
				'OTHER': {'code': 'XX', 'country': 'International', 'board': exam_format.upper(), 'region': 'Global', 'currency': 'USD'},
			}
			key = format_key or 'OTHER'
			mapped = format_country_map.get(key, format_country_map['OTHER'])

			country, _ = Country.objects.get_or_create(
				code=mapped['code'],
				defaults={'name': mapped['country'], 'region': mapped['region'], 'currency': mapped['currency']}
			)

			board, _ = ExamBoard.objects.get_or_create(
				name=mapped['board'],
				defaults={'full_name': f"{mapped['board']} Board", 'country': country, 'is_international': (mapped['code'] == 'XX')}
			)

			format_defaults = {
				'JAMB': {'duration': 60, 'pass_percent': 0.66},
				'WAEC': {'duration': 120, 'pass_percent': 0.5},
				'NABTEB': {'duration': 120, 'pass_percent': 0.5},
				'NECO': {'duration': 120, 'pass_percent': 0.5},
				'IGCSE': {'duration': 90, 'pass_percent': 0.5},
				'SAT': {'duration': 180, 'pass_percent': 0.5},
				'OTHER': {'duration': 60, 'pass_percent': 0.5}
			}

			defaults = format_defaults.get(key, format_defaults['OTHER'])
			duration_minutes = duration_minutes or defaults['duration']

			exam_type = ExamType.objects.create(
				name=(exam_format or 'CUSTOM').upper(),
				full_name=f"{(exam_format or 'Custom').upper()} Mock Exam",
				exam_board=board,
				level='SENIOR',
				duration_minutes=defaults['duration'],
				passing_score=int(defaults['pass_percent'] * num_questions),
				max_score=num_questions,
				description=f"Auto-created exam type for {exam_format}",
				exam_format={"format": exam_format},
			)

	# Start selecting questions from DB cache
	qs = Question.objects.filter(subject=subject, question_type='MCQ')
	if exam_type:
		qs = qs.filter(exam_type=exam_type)

	selected_questions = []
	available = qs.count()
	if available >= num_questions and not use_ai:
		selected_questions = random.sample(list(qs), num_questions)
	else:
		# Use whatever cached questions we have first
		if available > 0:
			selected_questions = list(qs)

		remaining = num_questions - len(selected_questions)

		# Generate missing questions using AI
		if remaining > 0:
			try:
				generated = ai.generate_questions(
					topic=subject.name,
					difficulty=difficulty,
					count=remaining,
					q_type='MCQ',
					additional_context=f"Exam type: {exam_format or 'General'}"
				)
				items = generated.get('questions', generated) if isinstance(generated, dict) else generated
				if not isinstance(items, list):
					raise ValueError('AI returned unexpected format for questions')

				topic = Topic.objects.filter(subject=subject).first()
				if not topic:
					topic = Topic.objects.create(
						subject=subject,
						name='General',
						difficulty='BEGINNER',
						order=0,
						estimated_hours=1.0,
						description='Auto-generated topic',
						learning_objectives=[]
					)

				for q_data in items:
					q = Question.objects.create(
						subject=subject,
						topic=topic,
						exam_type=exam_type,
						content=q_data.get('content', 'No content provided'),
						question_type=q_data.get('type', 'MCQ'),
						difficulty=q_data.get('difficulty', difficulty),
						guidance=q_data.get('explanation', ''),
						metadata=q_data.get('metadata', {}),
					)

					if q.question_type == 'MCQ':
						options = q_data.get('options', [])
						correct = q_data.get('correct_answer')
						for opt in options:
							is_correct = False
							try:
								if isinstance(correct, int):
									is_correct = (options.index(opt) == int(correct))
							except Exception:
								is_correct = False
							if isinstance(correct, str):
								is_correct = (opt.strip() == correct.strip())
							Answer.objects.create(
								question=q,
								content=opt,
								is_correct=is_correct,
								explanation=(q_data.get('explanation') if is_correct else '')
							)

					selected_questions.append(q)

			except Exception as e:
				logger.error(f"AI generation failed: {e}")
				# If we have any questions collected so far, proceed; otherwise raise
				if not selected_questions:
					raise ValueError('Unable to generate or fetch questions for the requested subject/format')

	# Finalize: shuffle and trim
	random.shuffle(selected_questions)
	selected_questions = selected_questions[:num_questions]

	# Create mock exam and link questions
	with transaction.atomic():
		exam_title = f"{(exam_format or 'Mock').upper()} Mock Exam - {subject.name}"
		pass_score = None
		if exam_type and getattr(exam_type, 'passing_score', None):
			pass_score = int(exam_type.passing_score)
		else:
			pass_score = int(0.5 * len(selected_questions))

		mock_exam = MockExam.objects.create(
			title=exam_title,
			description=f"Auto-generated mock exam ({exam_format}) for {subject.name}",
			exam_type=exam_type,
			subject=subject,
			creator=creator,
			duration_minutes=duration_minutes,
			total_marks=len(selected_questions),
			passing_score=pass_score
		)

		for idx, question in enumerate(selected_questions):
			MockExamQuestion.objects.create(mock_exam=mock_exam, question=question, order=idx + 1)

	logger.info(f"Created mock exam {mock_exam.id} with {len(selected_questions)} questions (subject: {subject.name})")
	return mock_exam
