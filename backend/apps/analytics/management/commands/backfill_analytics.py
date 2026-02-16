from django.core.management.base import BaseCommand
from django.db.models import Q
from apps.analytics.models import ProgressTracker, TopicMastery, StudySession
from apps.quiz.models import QuizAttempt, AnswerAttempt
from apps.exams.models import ExamResult
from apps.ai_tutor.models import ChatMessage
from apps.study_plans.models import StudyTask
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Backfill analytics data from existing quiz attempts'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user',
            type=int,
            help='User ID to backfill analytics for',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Backfill analytics for all users',
        )

    def handle(self, *args, **options):
        if options['user']:
            users = User.objects.filter(id=options['user'])
        elif options['all']:
            users = User.objects.all()
        else:
            self.stdout.write(self.style.ERROR('Please provide --user ID or --all'))
            return

        for user in users:
            self.stdout.write(f"Backfilling analytics for {user.username}...")
            self.backfill_user_analytics(user)

    def backfill_user_analytics(self, user):
        """Backfill analytics for a single user."""
        # Reset analytics
        progress, _ = ProgressTracker.objects.get_or_create(user=user)
        progress.total_quizzes_taken = 0
        progress.total_mock_exams_taken = 0
        progress.total_study_minutes = 0
        progress.total_questions_attempted = 0
        progress.total_correct_answers = 0
        progress.tutor_interactions_count = 0
        progress.current_streak = 0
        progress.longest_streak = 0
        progress.last_activity_date = None
        progress.save()

        # Reset topic mastery
        TopicMastery.objects.filter(user=user).delete()

        # Process all quiz attempts for this user
        quiz_attempts = QuizAttempt.objects.filter(
            user=user,
            status='COMPLETED'
        ).order_by('completed_at')

        if not quiz_attempts.exists():
            self.stdout.write(self.style.WARNING(f'  No completed quizzes for {user.username}'))
            return

        for attempt in quiz_attempts:
            # Update progress tracker
            progress.total_quizzes_taken += 1

            # Calculate answers
            answer_attempts = AnswerAttempt.objects.filter(quiz_attempt=attempt)
            total_answers = answer_attempts.count()
            correct_answers = answer_attempts.filter(is_correct=True).count()

            progress.total_questions_attempted += total_answers
            progress.total_correct_answers += correct_answers

            # Calculate study time
            duration = 0
            if attempt.completed_at and attempt.started_at:
                delta = attempt.completed_at - attempt.started_at
                duration = int(delta.total_seconds() / 60)
                progress.total_study_minutes += duration

            # Create StudySession for chart
            if attempt.completed_at:
                StudySession.objects.get_or_create(
                    user=user,
                    start_time=attempt.started_at or attempt.completed_at - timedelta(minutes=15),
                    end_time=attempt.completed_at,
                    defaults={
                        'subject': attempt.quiz.topic,
                        'duration_minutes': max(duration, 1),
                        'questions_answered': total_answers,
                        'correct_count': correct_answers
                    }
                )

            # Update last activity and calculate streak
            if attempt.completed_at:
                activity_date = attempt.completed_at.date()
                if progress.last_activity_date is None:
                    progress.current_streak = 1
                    progress.longest_streak = 1
                    progress.last_activity_date = activity_date
                elif activity_date > progress.last_activity_date:
                    if activity_date == progress.last_activity_date + timedelta(days=1):
                        progress.current_streak += 1
                        if progress.current_streak > progress.longest_streak:
                            progress.longest_streak = progress.current_streak
                    else:
                        # Streak broken
                        progress.current_streak = 1
                    progress.last_activity_date = activity_date

            progress.save()

            # Update topic mastery
            if attempt.quiz.topic and total_answers > 0:
                self._update_mastery(user, attempt.quiz.topic, (correct_answers / total_answers) * 100, attempt.quiz.subject.name if attempt.quiz.subject else None)

        # Process Mock Exams
        exam_results = ExamResult.objects.filter(attempt__user=user).order_by('generated_at')
        for result in exam_results:
            progress.total_mock_exams_taken += 1
            progress.total_questions_attempted += result.attempt.attempted_questions
            progress.total_correct_answers += result.correct_answers
            
            duration = 0
            if result.attempt.completed_at and result.attempt.started_at:
                delta = result.attempt.completed_at - result.attempt.started_at
                duration = int(delta.total_seconds() / 60)
                progress.total_study_minutes += duration
            
            # Create StudySession for chart
            if result.attempt.completed_at:
                StudySession.objects.get_or_create(
                    user=user,
                    start_time=result.attempt.started_at or result.attempt.completed_at - timedelta(minutes=60),
                    end_time=result.attempt.completed_at,
                    defaults={
                        'subject': result.attempt.mock_exam.subject.name,
                        'duration_minutes': max(duration, 1),
                        'questions_answered': result.attempt.attempted_questions,
                        'correct_count': result.correct_answers
                    }
                )

            self._update_mastery(user, result.attempt.mock_exam.subject.name, result.percentage, result.attempt.mock_exam.subject.name)
            progress.save()

        # Process Tutor Interactions
        tutor_messages = ChatMessage.objects.filter(session__user=user, role='user').count()
        progress.tutor_interactions_count = tutor_messages
        
        # Process Study Tasks
        completed_tasks = StudyTask.objects.filter(study_plan__user=user, status='completed')
        for task in completed_tasks:
            progress.total_study_minutes += int(task.actual_time_spent_seconds / 60)
        
        progress.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓ Backfilled {progress.total_quizzes_taken} quizzes, '
                f'{progress.total_mock_exams_taken} exams, '
                f'{progress.tutor_interactions_count} tutor messages, '
                f'{progress.total_questions_attempted} total questions'
            )
        )

    def _update_mastery(self, user, topic_name, score, subject_name):
        mastery, created = TopicMastery.objects.get_or_create(
            user=user,
            topic=topic_name,
            defaults={
                'mastery_score': score,
                'quizzes_taken': 1,
                'subject': subject_name,
            }
        )

        if not created:
            total_score = (mastery.mastery_score * mastery.quizzes_taken) + score
            mastery.quizzes_taken += 1
            mastery.mastery_score = total_score / mastery.quizzes_taken
            if subject_name:
                mastery.subject = subject_name
            mastery.save()
