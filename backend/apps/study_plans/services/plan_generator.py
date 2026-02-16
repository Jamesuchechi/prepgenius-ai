
import logging
import json
from datetime import datetime, timedelta, time
from typing import Dict, List, Optional, Tuple
from django.utils import timezone
from django.db import transaction
from django.db.models import Q

from apps.content.models import Topic, Subject, ExamType
from apps.analytics.models import TopicMastery, ProgressTracker
from ai_services.router import AIRouter
from ..models import StudyPlan, StudyTask, StudyReminder

logger = logging.getLogger(__name__)

class StudyPlanGenerationService:
    """Service for AI-based study plan generation."""
    
    def __init__(self):
        self.ai_router = AIRouter()
    
    def generate_study_plan(
        self,
        user,
        exam_type: ExamType,
        exam_date: datetime.date,
        subjects: List[Subject],
        study_hours_per_day: float = 2.5,
        study_days_per_week: int = 6,
        difficulty_preference: str = 'intermediate',
        include_weekends: bool = True,
        plan_name: Optional[str] = None
    ) -> Tuple[StudyPlan, List[StudyTask]]:
        """
        Generate a comprehensive study plan using AI.
        
        Args:
            user: The user for whom to generate the plan
            exam_type: The target exam type
            exam_date: Target exam date
            subjects: List of subjects to study
            study_hours_per_day: Daily study hours target
            study_days_per_week: Days available per week
            difficulty_preference: Difficulty level preference
            include_weekends: Whether to include weekends in schedule
            plan_name: Custom name for the plan
            
        Returns:
            Tuple of (StudyPlan, List of StudyTasks)
        """
        
        # Build study plan context
        days_until_exam = (exam_date - timezone.now().date()).days
        
        plan_context = {
            "user_email": user.email,
            "exam_type": exam_type.name,
            "subjects": [s.name for s in subjects],
            "days_available": days_until_exam,
            "daily_hours": study_hours_per_day,
            "weekly_days": study_days_per_week,
            "difficulty_level": difficulty_preference,
            "schedules_weekends": include_weekends,
            "learning_pace": self._determine_learning_pace(study_hours_per_day),
        }
        
        # Try to get user's learning history if available
        try:
            progress_tracker = ProgressTracker.objects.get(user=user)
            plan_context["total_study_time"] = progress_tracker.total_study_minutes / 60
            plan_context["mastery_subjects"] = self._get_mastered_subjects(user)
            plan_context["weak_subjects"] = self._get_weak_subjects(user)
        except ProgressTracker.DoesNotExist:
            pass
        
        # Generate AI-powered study schedule
        ai_prompt = self._build_study_plan_prompt(plan_context)
        
        try:
            ai_plan = self.ai_router.generate_study_plan(
                exam_type=exam_type.name,
                subjects=[s.name for s in subjects],
                days_available=days_until_exam,
                difficulty_level=difficulty_preference,
                daily_hours=study_hours_per_day,
                weekly_days=study_days_per_week
            )
        except Exception as e:
            logger.warning(f"AI generation failed: {e}. Using template-based approach.")
            ai_plan = None
        
        # Create study plan
        plan_name = plan_name or f"{exam_type.name} Study Plan - {exam_date.strftime('%b %Y')}"
        
        study_plan = StudyPlan.objects.create(
            user=user,
            exam_type=exam_type,
            name=plan_name,
            description=f"AI-generated study plan targeting {exam_type.name} on {exam_date.strftime('%B %d, %Y')}",
            plan_type='ai_generated' if ai_plan else 'template',
            exam_date=exam_date,
            start_date=timezone.now().date(),
            status='draft',
            study_hours_per_day=study_hours_per_day,
            study_days_per_week=study_days_per_week,
            difficulty_preference=difficulty_preference,
            include_weekends=include_weekends,
            ai_prompt_used=ai_prompt,
            ai_provider='groq' if ai_plan else 'template',
            confidence_score=0.85 if ai_plan else 0.6,
        )
        
        study_plan.subjects.set(subjects)
        
        # Generate study schedule
        tasks = self._generate_study_schedule(
            study_plan=study_plan,
            subjects=subjects,
            exam_date=exam_date,
            daily_hours=study_hours_per_day,
            weekly_days=study_days_per_week,
            include_weekends=include_weekends,
            ai_plan=ai_plan
        )
        
        # Update plan with generated tasks info
        study_plan.update_progress()
        
        logger.info(f"Generated study plan {study_plan.id} for user {user.email} with {len(tasks)} tasks")
        
        return study_plan, tasks
    
    def _build_study_plan_prompt(self, context: Dict) -> str:
        """Build detailed prompt for AI study plan generation."""
        
        prompt = f"""
        Generate a detailed study plan for an exam candidate with the following details:
        
        Exam Type: {context['exam_type']}
        Subjects: {', '.join(context['subjects'])}
        Days Until Exam: {context['days_available']}
        Daily Study Hours: {context['daily_hours']}
        Study Days Per Week: {context['weekly_days']}
        Difficulty Level: {context['difficulty_level']}
        Include Weekends: {context['schedules_weekends']}
        Learning Pace: {context['learning_pace']}
        
        {f"Previous Study Time: {context.get('total_study_time', 0)} hours" if 'total_study_time' in context else ""}
        {f"Mastered Subjects: {', '.join(context.get('mastery_subjects', []))}" if context.get('mastery_subjects') else ""}
        {f"Weak Subjects: {', '.join(context.get('weak_subjects', []))}" if context.get('weak_subjects') else ""}
        
        Please provide:
        1. An optimal topic sequencing (start with fundamentals, progress to advanced)
        2. Recommended hours for each major topic
        3. Breaks and revision schedule
        4. Key focus areas based on previous performance
        5. Integration of strong areas for confidence building
        6. Daily schedule structure
        
        Format the response as a structured study schedule with topic names, estimated hours, and sequencing.
        """
        
        return prompt.strip()
    
    def _generate_study_schedule(
        self,
        study_plan: StudyPlan,
        subjects: List[Subject],
        exam_date: datetime.date,
        daily_hours: float,
        weekly_days: int,
        include_weekends: bool,
        ai_plan: Optional[Dict] = None
    ) -> List[StudyTask]:
        """
        Generate detailed study tasks from the study plan.
        """
        tasks = []
        current_date = study_plan.start_date
        
        # If we have an AI plan with a specific topic sequence, use it
        if ai_plan and "topic_sequence" in ai_plan:
            logger.info("Generating schedule from AI topic sequence")
            for idx, item in enumerate(ai_plan["topic_sequence"]):
                # Skip weekends if not included
                while current_date.weekday() > 4 and not include_weekends:
                    current_date += timedelta(days=1)
                
                if current_date >= exam_date:
                    break
                
                # Extract details from AI item
                subject_name = item.get("subject", subjects[0].name)
                topic_name = item.get("topic_name", f"{subject_name} Fundamentals")
                duration_hours = float(item.get("estimated_hours", 2.0))
                learning_objectives = item.get("learning_objectives", [])
                priority = item.get("priority", "medium")

                # Find or create a matching topic in DB
                db_subject = next((s for s in subjects if s.name.lower() in subject_name.lower()), subjects[0])
                db_topic = Topic.objects.filter(
                    Q(name__icontains=topic_name) | Q(name__icontains="General"),
                    subject=db_subject
                ).first()

                # Fallback to creating a generic description if topic is generic
                task_description = f"Study {topic_name}" if "General" not in topic_name else f"Study {db_subject.name} Fundamentals"
                if study_plan.exam_type:
                    task_description += f" for {study_plan.exam_type.name}"

                end_date = self._calculate_task_end_date(current_date, duration_hours, daily_hours, include_weekends)
                end_date = min(end_date, exam_date - timedelta(days=1))
                if end_date <= current_date:
                    end_date = current_date + timedelta(days=1)

                try:
                    task = StudyTask.objects.create(
                        study_plan=study_plan,
                        subject=db_subject,
                        topic=db_topic or Topic.objects.get_or_create(
                            name=f"{db_subject.name} Fundamentals", 
                            subject=db_subject, 
                            defaults={"difficulty": "BEGINNER", "estimated_hours": 2}
                        )[0],
                        scheduled_start_date=current_date,
                        scheduled_end_date=end_date,
                        estimated_duration_hours=duration_hours,
                        description=task_description,
                        learning_objectives=learning_objectives or self._get_learning_objectives(db_topic) if db_topic else [],
                        status='pending',
                        priority=priority,
                        difficulty_level=study_plan.difficulty_preference,
                    )
                    self._create_task_reminder(task)
                    tasks.append(task)
                    current_date = end_date + timedelta(days=1)
                except Exception as e:
                    logger.error(f"Error creating AI-based task {topic_name}: {e}")
                    continue
        else:
            # Fallback to template-based generation if no AI plan
            logger.info("Using template-based schedule generation")
            topic_list = self._get_topics_for_subjects(subjects, study_plan.difficulty_preference)
            
            if not topic_list:
                logger.warning(f"No topics found and no AI plan available.")
                return tasks

            hours_per_topic = (exam_date - current_date).days * daily_hours * (weekly_days / 7) / len(topic_list)
            revision_topic_count = max(2, len(topic_list) // 4)

            for idx, topic in enumerate(topic_list):
                while current_date.weekday() > 4 and not include_weekends:
                    current_date += timedelta(days=1)
                if current_date >= exam_date:
                    break
                
                is_revision = idx >= len(topic_list) - revision_topic_count
                duration_hours = hours_per_topic * 0.5 if is_revision else hours_per_topic
                
                end_date = self._calculate_task_end_date(current_date, duration_hours, daily_hours, include_weekends)
                end_date = min(end_date, exam_date - timedelta(days=1))
                if end_date <= current_date:
                    end_date = current_date + timedelta(days=1)

                try:
                    task = StudyTask.objects.create(
                        study_plan=study_plan,
                        subject=topic.subject,
                        topic=topic,
                        scheduled_start_date=current_date,
                        scheduled_end_date=end_date,
                        estimated_duration_hours=duration_hours,
                        description=f"Study {topic.name} for {study_plan.exam_type.name}" if "General" not in topic.name else f"Core {topic.subject.name} Review for {study_plan.exam_type.name}",
                        learning_objectives=self._get_learning_objectives(topic),
                        status='pending',
                        priority=self._determine_priority(idx, len(topic_list), is_revision),
                        difficulty_level=study_plan.difficulty_preference,
                    )
                    self._create_task_reminder(task)
                    tasks.append(task)
                    current_date = end_date + timedelta(days=1)
                except Exception as e:
                    logger.error(f"Error creating template task for {topic.name}: {e}")
                    continue
        
        self._create_final_revision_reminders(study_plan, exam_date)
        return tasks
    
    def _get_topics_for_subjects(
        self,
        subjects: List[Subject],
        difficulty_level: str
    ) -> List[Topic]:
        """Get all topics for given subjects, ordered by difficulty."""
        
        topics = Topic.objects.filter(subject__in=subjects).select_related('subject')
        
        # Order by difficulty preference (using 'difficulty' field)
        if difficulty_level == 'beginner':
            topics = topics.order_by('difficulty')
        elif difficulty_level == 'advanced':
            topics = topics.order_by('-difficulty')
        else:  # intermediate
            topics = topics.order_by('difficulty')
        
        return list(topics)
    
    def _calculate_task_end_date(
        self,
        start_date: datetime.date,
        duration_hours: float,
        daily_hours: float,
        include_weekends: bool
    ) -> datetime.date:
        """
        Calculate the end date for a task based on duration and daily hours.
        """
        
        if daily_hours == 0:
            return start_date + timedelta(days=1)
        
        days_needed = duration_hours / daily_hours
        current_date = start_date
        days_count = 0
        
        while days_count < days_needed:
            if include_weekends or current_date.weekday() < 5:
                days_count += 1
            current_date += timedelta(days=1)
        
        return current_date
    
    def _determine_priority(
        self,
        idx: int,
        total_topics: int,
        is_revision: bool
    ) -> str:
        """Determine task priority based on position in schedule."""
        
        if is_revision:
            return 'high'
        
        position_ratio = idx / total_topics if total_topics > 0 else 0
        
        if position_ratio < 0.25:  # First 25%
            return 'critical'
        elif position_ratio < 0.5:  # Second 25%
            return 'high'
        elif position_ratio < 0.75:  # Third 25%
            return 'medium'
        else:  # Last 25%
            return 'low'
    
    def _get_learning_objectives(self, topic: Topic) -> List[str]:
        """Extract or generate learning objectives for a topic."""
        
        objectives = [
            f"Understand fundamental concepts of {topic.name}",
            f"Master problem-solving techniques in {topic.name}",
            f"Practice application of {topic.name} concepts",
            f"Review and consolidate {topic.name} knowledge"
        ]
        
        return objectives
    
    def _determine_learning_pace(self, daily_hours: float) -> str:
        """Determine learning pace based on daily hours."""
        
        if daily_hours < 1.5:
            return 'slow'
        elif daily_hours < 3:
            return 'moderate'
        elif daily_hours < 5:
            return 'fast'
        else:
            return 'intensive'
    
    def _get_mastered_subjects(self, user) -> List[str]:
        """Get subjects the user has mastered (>80% mastery)."""
        
        masteries = TopicMastery.objects.filter(
            user=user,
            mastery_score__gte=80.0
        ).values_list('subject', flat=True).distinct()
        
        return list(set(masteries))
    
    def _get_weak_subjects(self, user) -> List[str]:
        """Get subjects where user is weak (<50% mastery)."""
        
        masteries = TopicMastery.objects.filter(
            user=user,
            mastery_score__lt=50.0,
            quizzes_taken__gt=0
        ).values_list('subject', flat=True).distinct()
        
        return list(set(masteries))
    
    def _create_task_reminder(self, task: StudyTask):
        """Create a reminder for task start."""
        
        reminder_date = task.scheduled_start_date - timedelta(days=1)
        
        StudyReminder.objects.create(
            study_task=task,
            user=task.study_plan.user,
            reminder_type='task_start',
            scheduled_datetime=timezone.make_aware(
                datetime.combine(reminder_date, time(9, 0))
            ),
            title=f"Upcoming: {task.topic.name}",
            message=f"You have scheduled to start studying {task.topic.name} tomorrow.",
            frequency='once'
        )
    
    def _create_final_revision_reminders(self, study_plan: StudyPlan, exam_date: datetime.date):
        """Create reminders for final revision period."""
        
        # Create reminder 7 days before exam
        StudyReminder.objects.create(
            study_plan=study_plan,
            user=study_plan.user,
            reminder_type='daily_goal',
            scheduled_datetime=timezone.make_aware(
                datetime.combine(exam_date - timedelta(days=7), time(8, 0))
            ),
            title="One week to exam - Final revision starts",
            message="You have one week until your exam. Begin intensive revision of weak areas.",
            frequency='daily'
        )
        
        # Create reminder 1 day before exam
        StudyReminder.objects.create(
            study_plan=study_plan,
            user=study_plan.user,
            reminder_type='task_deadline',
            scheduled_datetime=timezone.make_aware(
                datetime.combine(exam_date - timedelta(days=1), time(15, 0))
            ),
            title="Your exam is tomorrow!",
            message="Get a good night's rest. Your exam is tomorrow. Review your study plan summary.",
            frequency='once'
        )
