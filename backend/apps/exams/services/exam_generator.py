
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
				'IELTS': {'code': 'GB', 'country': 'United Kingdom', 'board': 'British Council', 'region': 'Europe', 'currency': 'GBP'},
				'TOEFL': {'code': 'US', 'country': 'United States', 'board': 'ETS', 'region': 'Americas', 'currency': 'USD'},
				'GRE': {'code': 'US', 'country': 'United States', 'board': 'ETS', 'region': 'Americas', 'currency': 'USD'},
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
				import concurrent.futures
				
				# Get API tokens (primary and secondary)
				tokens = []
				primary_token = getattr(settings, 'ALOC_ACCESS_TOKEN', None)
				if primary_token:
					tokens.append(primary_token)
				
				secondary_token = getattr(settings, 'ALOC_ACCESS_TOKEN_SECONDARY', None)
				if secondary_token:
					tokens.append(secondary_token)
				
				base = getattr(settings, 'ALOC_BASE_URL', None)
				
				if base and tokens and remaining > 0:
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

					target_fetch = remaining + 5 
					max_workers = 10 # Reasonable concurrency limit
					
					logger.info(f"Starting parallel fetch for {target_fetch} questions using {len(tokens)} keys...")
					
					fetched_count = 0
					
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

					def fetch_single_question(idx):
						# Round-robin key selection
						token = tokens[idx % len(tokens)]
						headers = {'AccessToken': token}
						try:
							resp = requests.get(f"{base.rstrip('/')}/q", params=params, headers=headers, timeout=10)
							if resp.status_code == 200:
								try:
									return resp.json()
								except Exception:
									logger.warning(f"ALOC API returned invalid JSON: {resp.text[:200]}...")
									return None
						except Exception as e:
							logger.warning(f"Request {idx} failed: {e}")
						return None

					with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
						# Submit tasks
						futures = [executor.submit(fetch_single_question, i) for i in range(target_fetch)]
						
						for future in concurrent.futures.as_completed(futures):
							if len(selected_questions) >= num_questions:
								break
								
							data = future.result()
							if not data:
								continue
								
							# API returns { ..., "data": { "id": ..., "question": ... } }
							item = data.get('data')
							
							if item and isinstance(item, dict):
								q_text = item.get('question')
								if not q_text:
									continue
									
								q_meta = {
									'source': 'ALOC', 
									'year': year, 
									'external_id': item.get('id')
								}
								
								try:
									with transaction.atomic():
										question_obj, created = Question.objects.get_or_create(
											content=q_text,
											subject=subject,
											defaults={
												'topic': topic,
												'question_type': 'MCQ',
												'difficulty': 'MEDIUM',
												'guidance': item.get('answer', ''),
												'metadata': q_meta
											}
										)
										
										if created:
											opts_data = item.get('option', {})
											correct_letter = str(item.get('answer', '')).lower()
											
											for letter, opt_text in opts_data.items():
												if not opt_text: continue
												is_correct = (letter.lower() == correct_letter)
												Answer.objects.create(
													question=question_obj,
													content=opt_text,
													is_correct=is_correct,
													explanation=''
												)
									
									if question_obj not in selected_questions:
										selected_questions.append(question_obj)
										fetched_count += 1
										
								except Exception as db_err:
									logger.error(f"Error saving fetched question: {db_err}")
							
					logger.info(f"Parallel fetch completed. Got {fetched_count} unique questions. Total selected: {len(selected_questions)}")

				else:
					logger.warning(f"ALOC not configured or insufficient remaining.")
							
			except Exception as e:
				logger.warning(f"ALOC API error (will try with cached questions): {e}")
		
		# If still not enough questions, try AI as fallback (Hybrid Mode)
		if len(selected_questions) < num_questions:
			missing_count = num_questions - len(selected_questions)
			logger.info(f"Only found {len(selected_questions)} past questions. Generating {missing_count} AI fallback questions.")
			
			fallback_retries = 0
			MAX_FALLBACK_RETRIES = 5
			
			while len(selected_questions) < num_questions and fallback_retries < MAX_FALLBACK_RETRIES:
				current_missing = num_questions - len(selected_questions)
				# Request in batches of 20 to ensure completion and quality
				batch_size = min(current_missing, 20)
				logger.info(f"AI Fallback Batch {fallback_retries+1}: Requesting {batch_size} questions...")
				
				try:
					# Reuse AI generation logic for objective questions
					batch_context = f"Based on {exam_format} past exam style for year {year}. Mimic the style of existing questions. Generate SET #{fallback_retries + 1} with unique content."
					
					generated = ai.generate_questions(
						topic=subject.name,
						difficulty=difficulty,
						count=batch_size,
						q_type='MCQ',
						additional_context=batch_context
					)
					items = generated.get('questions', generated) if isinstance(generated, dict) else generated
					if not isinstance(items, list):
						items = [] # Handle error gracefully
						logger.warning("AI returned unexpected format, skipping fallback batch.")

					topic_fallback = Topic.objects.filter(subject=subject).first()
					if not topic_fallback:
						topic_fallback = Topic.objects.create(
							subject=subject, 
							name='General', 
							difficulty='BEGINNER',
							description='Auto-generated topic'
						)

					batch_added = 0
					for q_data in items:
						try:
							# Check for duplicates based on content
							content = q_data.get('content', 'No content provided')
							if Question.objects.filter(subject=subject, content=content).exists():
								# If duplicate, verify if it's already in our selection
								existing_q = Question.objects.filter(subject=subject, content=content).first()
								if existing_q not in selected_questions:
									selected_questions.append(existing_q)
									batch_added += 1
								continue

							q = Question.objects.create(
								subject=subject,
								topic=topic_fallback,
								exam_type=exam_type,
								content=content,
								question_type='MCQ',
								difficulty=q_data.get('difficulty', difficulty),
								guidance=q_data.get('explanation', ''),
								metadata={'source': 'AI_FALLBACK', 'original_mode': 'past_questions', 'year': year},
							)

							options = q_data.get('options', [])
							correct = q_data.get('correct_answer')
							for opt in options:
								is_correct = False
								if isinstance(correct, int) and 0 <= correct < len(options):
									is_correct = (options.index(opt) == correct)
								elif isinstance(correct, str):
									is_correct = (opt.strip() == correct.strip())
								
								Answer.objects.create(
									question=q,
									content=opt,
									is_correct=is_correct,
									explanation=(q_data.get('explanation') if is_correct else '')
								)

							selected_questions.append(q)
							batch_added += 1
						except Exception as q_err:
							logger.error(f"Failed to save AI fallback question: {q_err}")
					
					logger.info(f"AI Fallback Batch {fallback_retries+1}: Added {batch_added} questions.")
					if batch_added == 0:
						logger.warning("AI returned 0 valid new questions. Stopping to avoid infinite loop.")
						break

				except Exception as ai_err:
					logger.error(f"AI fallback generation failed for batch: {ai_err}")
				
				fallback_retries += 1

			# Final check
			if len(selected_questions) == 0:
				raise ValueError(f'No past exam questions found for {subject.name} ({exam_format}, {year}) and AI fallback failed. Please try a different year or exam format.')
			
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
		# Standard WAEC/NECO/JAMB typically has Theory questions too.
		# ALOC doesn't provide them reliably, so we use AI to generate them if needed.
		if mode == 'past_questions' and exam_format.upper() in ['WAEC', 'NECO', 'JAMB']:
			theory_count = 4 # Standardize on 4 theory questions for now
			logger.info(f"Generating {theory_count} theory questions via AI for {subject.name} ({exam_format})")
			
			try:
				# Use AI to generate theory questions matching the subject/year context
				generated_theory = ai.generate_questions(
					topic=subject.name,
					difficulty='HARD',
					count=theory_count,
					q_type='THEORY', # Request theory/essay type
					additional_context=f"Generate standard {exam_format} theory/essay questions for {subject.name}. Year context: {year}. Output full question text."
				)
				
				t_items = generated_theory.get('questions', generated_theory) if isinstance(generated_theory, dict) else generated_theory
				if isinstance(t_items, list):
					topic = Topic.objects.filter(subject=subject).first()
					
					for t_data in t_items:
						try:
							q_content = t_data.get('content') or t_data.get('question')
							if not q_content: continue

							# Check duplication
							if Question.objects.filter(content=q_content, subject=subject).exists():
								q = Question.objects.filter(content=q_content, subject=subject).first()
							else:
								q = Question.objects.create(
									subject=subject,
									topic=topic,
									exam_type=exam_type,
									content=q_content,
									question_type='THEORY', # Explicitly set as THEORY
									difficulty='HARD',
									guidance=t_data.get('answer', '') or t_data.get('explanation', ''),
									metadata={'source': 'AI_THEORY_FALLBACK', 'year': year}
								)
								# Theory doesn't have options/answers in the same way, but we store the model answer in guidance
							
							selected_questions.append(q)
						except Exception as t_err:
							logger.error(f"Failed to save theory question: {t_err}")

			except Exception as ai_err:
				logger.warning(f"Failed to generate theory questions: {ai_err}")

		# Shuffle questions to avoid predictable patterns
		random.shuffle(selected_questions)

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
				'IELTS': {'code': 'GB', 'country': 'United Kingdom', 'board': 'British Council', 'region': 'Europe', 'currency': 'GBP'},
				'TOEFL': {'code': 'US', 'country': 'United States', 'board': 'ETS', 'region': 'Americas', 'currency': 'USD'},
				'GRE': {'code': 'US', 'country': 'United States', 'board': 'ETS', 'region': 'Americas', 'currency': 'USD'},
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
				'IELTS': {'duration': 165, 'pass_percent': 0.6},
				'TOEFL': {'duration': 180, 'pass_percent': 0.6},
				'GRE': {'duration': 225, 'pass_percent': 0.6},
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

		# Generate missing questions using AI (Parallelized)
		if remaining > 0:
			import asyncio
			from asgiref.sync import async_to_sync
			
			batch_size = 10
			# Calculate number of batches needed
			num_batches = (remaining + batch_size - 1) // batch_size
			
			logger.info(f"Generating {remaining} questions in {num_batches} parallel async batches...")
			
			generated_items = []
			
			async def fetch_batch_async(batch_idx):
				try:
					batch_context = f"Exam type: {exam_format or 'General'}. Batch {batch_idx+1}."
					current_ai = AIRouter() # New instance for safety, though stateless usually
					
					generated = await current_ai.generate_questions_async(
						topic=subject.name,
						difficulty=difficulty,
						count=batch_size,
						q_type='MCQ',
						additional_context=batch_context
					)
					
					items = generated.get('questions', generated) if isinstance(generated, dict) else generated
					if isinstance(items, list):
						return items
					return []
				except Exception as e:
					logger.error(f"Async Batch {batch_idx+1} failed: {e}")
					return []

			async def run_all_batches():
				tasks = [fetch_batch_async(i) for i in range(num_batches)]
				results = await asyncio.gather(*tasks)
				return [item for sublist in results for item in sublist]

			try:
				generated_items = async_to_sync(run_all_batches)()
			except Exception as e:
				logger.error(f"Async generation failed: {e}")
			
			if not generated_items:
				# If all parallel batches failed, raise error (or maybe we retry sequentially? No, just fail for now)
				if not selected_questions:
					logger.error("All AI batches failed to return questions.")
					# Could raise, but maybe we have *some* cached questions?
					# If strict req, raise.
					raise ValueError('Unable to generate questions for the requested subject/format (AI service error).')
			
			# Process all generated items
			logger.info(f"AI returned {len(generated_items)} raw items. Processing...")
			
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

			for q_data in generated_items:
				# Stop if we have enough
				if len(selected_questions) >= num_questions:
					break
					
				try:
					# Deduplication check
					content = q_data.get('content', 'No content provided')
					if Question.objects.filter(subject=subject, content=content).exists():
						continue
						
					q = Question.objects.create(
						subject=subject,
						topic=topic,
						exam_type=exam_type,
						content=content,
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
					logger.warning(f"Failed to save generated question: {e}")
					continue

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
