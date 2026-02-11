"""
Services for study plan generation, scheduling, and adjustment.
"""

import logging
import json
from datetime import datetime, timedelta, time
from typing import Dict, List, Optional, Tuple
from django.utils import timezone
from django.db import transaction

from apps.content.models import Topic, Subject, ExamType
from apps.analytics.models import TopicMastery, ProgressTracker
from ai_services.router import AIRouter
from ..models import StudyPlan, StudyTask, StudyReminder, AdjustmentHistory

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
            plan_context["total_study_time"] = progress_tracker.total_study_time_seconds / 3600
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
        
        Returns:
            List of created StudyTask objects
        """
        
        tasks = []
        current_date = study_plan.start_date
        hours_allocated = 0
        total_available_hours = (
            (exam_date - current_date).days * daily_hours * (weekly_days / 7)
        )
        
        # Get all topics for the subjects
        topic_list = self._get_topics_for_subjects(
            subjects,
            study_plan.difficulty_preference
        )
        
        if not topic_list:
            logger.warning(f"No topics found for subjects: {[s.name for s in subjects]}")
            return tasks
        
        # Calculate hours per topic
        hours_per_topic = total_available_hours / len(topic_list)
        revision_topic_count = max(2, len(topic_list) // 4)  # 25% for revision
        
        task_counter = 0
        
        for idx, topic in enumerate(topic_list):
            # Skip weekends if not included
            while current_date.weekday() > 4 and not include_weekends:  # 5=Saturday, 6=Sunday
                current_date += timedelta(days=1)
            
            # Check if we've exceeded exam date
            if current_date >= exam_date:
                break
            
            # Determine task duration (first pass gets normal hours, last 25% gets review)
            is_revision = idx >= len(topic_list) - revision_topic_count
            if is_revision:
                duration_hours = hours_per_topic * 0.5  # Revision takes half time
            else:
                duration_hours = hours_per_topic
            
            # Create task
            end_date = self._calculate_task_end_date(
                current_date,
                duration_hours,
                daily_hours,
                include_weekends
            )
            
            # Ensure end date doesn't exceed exam date
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
                    description=f"Study {topic.name} for {study_plan.exam_type.name}",
                    learning_objectives=self._get_learning_objectives(topic),
                    status='pending',
                    priority=self._determine_priority(idx, len(topic_list), is_revision),
                    difficulty_level=study_plan.difficulty_preference,
                )
                
                # Set reminder for 1 day before task starts
                self._create_task_reminder(task)
                
                tasks.append(task)
                hours_allocated += duration_hours
                task_counter += 1
                
                # Move to next available study date
                current_date = end_date + timedelta(days=1)
                
            except Exception as e:
                logger.error(f"Error creating task for topic {topic.name}: {e}")
                continue
        
        # Create final revision reminders
        self._create_final_revision_reminders(study_plan, exam_date)
        
        logger.info(f"Created {task_counter} tasks for study plan {study_plan.id}")
        
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
            mastery_percentage__gte=80.0
        ).values_list('topic__subject__name', flat=True).distinct()
        
        return list(set(masteries))
    
    def _get_weak_subjects(self, user) -> List[str]:
        """Get subjects where user is weak (<50% mastery)."""
        
        masteries = TopicMastery.objects.filter(
            user=user,
            mastery_percentage__lt=50.0,
            total_attempts__gt=0
        ).values_list('topic__subject__name', flat=True).distinct()
        
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


class StudyPlanAdjustmentService:
    """Service for adjusting study plans based on performance."""
    
    @staticmethod
    def adjust_plan_for_performance(
        study_plan: StudyPlan,
        performance_data: Dict
    ) -> Optional[AdjustmentHistory]:
        """
        Adjust study plan based on user's performance metrics.
        
        Args:
            study_plan: The study plan to adjust
            performance_data: Performance metrics
            
        Returns:
            AdjustmentHistory object if adjustment was made
        """
        
        adjustment = None
        
        # Check mastery score
        if 'mastery_score' in performance_data:
            mastery = performance_data['mastery_score']
            
            if mastery > 85:
                # User is performing well, can increase difficulty
                adjustment = StudyPlanAdjustmentService._increase_difficulty(
                    study_plan,
                    performance_data
                )
            elif mastery < 40:
                # User is struggling, decrease difficulty
                adjustment = StudyPlanAdjustmentService._decrease_difficulty(
                    study_plan,
                    performance_data
                )
        
        # Check pace
        if 'pace_ratio' in performance_data and adjustment is None:
            pace = performance_data['pace_ratio']
            
            if pace > 1.2:  # Ahead of schedule
                adjustment = StudyPlanAdjustmentService._accelerate_pace(
                    study_plan,
                    performance_data
                )
            elif pace < 0.8:  # Behind schedule
                adjustment = StudyPlanAdjustmentService._extend_deadlines(
                    study_plan,
                    performance_data
                )
        
        return adjustment
    
    @staticmethod
    def _increase_difficulty(study_plan: StudyPlan, data: Dict) -> AdjustmentHistory:
        """Increase difficulty level of remaining tasks."""
        
        pending_tasks = study_plan.tasks.filter(status__in=['pending', 'in_progress'])
        
        for task in pending_tasks:
            if task.difficulty_level != 'advanced':
                task.difficulty_level = 'advanced'
                task.save()
        
        return AdjustmentHistory.objects.create(
            study_plan=study_plan,
            adjustment_type='difficulty_increase',
            reason='User is performing well and can handle advanced material',
            performance_metric='mastery_score',
            performance_threshold=85.0,
            actual_performance=data.get('mastery_score', 0)
        )
    
    @staticmethod
    def _decrease_difficulty(study_plan: StudyPlan, data: Dict) -> AdjustmentHistory:
        """Decrease difficulty level and add more practice."""
        
        pending_tasks = study_plan.tasks.filter(status__in=['pending', 'in_progress'])
        
        for task in pending_tasks:
            if task.difficulty_level != 'beginner':
                task.difficulty_level = 'intermediate'
                task.save()
        
        return AdjustmentHistory.objects.create(
            study_plan=study_plan,
            adjustment_type='difficulty_decrease',
            reason='User is struggling. Reducing difficulty and adding foundational content',
            performance_metric='mastery_score',
            performance_threshold=40.0,
            actual_performance=data.get('mastery_score', 0)
        )
    
    @staticmethod
    def _accelerate_pace(study_plan: StudyPlan, data: Dict) -> AdjustmentHistory:
        """Reduce study time for remaining tasks since user is ahead."""
        
        pending_tasks = study_plan.tasks.filter(status__in=['pending']).order_by('scheduled_start_date')
        
        for task in pending_tasks[:3]:  # Reduce first 3 pending tasks
            task.estimated_duration_hours = max(0.5, task.estimated_duration_hours * 0.75)
            task.save()
        
        return AdjustmentHistory.objects.create(
            study_plan=study_plan,
            adjustment_type='pace_adjustment',
            reason='User is ahead of schedule. Reducing remaining task durations',
            performance_metric='pace_ratio',
            performance_threshold=1.2,
            actual_performance=data.get('pace_ratio', 0)
        )
    
    @staticmethod
    def _extend_deadlines(study_plan: StudyPlan, data: Dict) -> AdjustmentHistory:
        """Extend deadlines for remaining tasks."""
        
        pending_tasks = study_plan.tasks.filter(status__in=['pending']).order_by('scheduled_start_date')
        days_extension = 3
        
        for task in pending_tasks:
            task.scheduled_end_date += timedelta(days=days_extension)
            task.save()
        
        # Extend plan completion date
        study_plan.estimated_completion_date = (
            study_plan.estimated_completion_date + timedelta(days=days_extension)
            if study_plan.estimated_completion_date
            else None
        )
        study_plan.save()
        
        return AdjustmentHistory.objects.create(
            study_plan=study_plan,
            adjustment_type='deadline_extended',
            reason=f'User is behind schedule. Extended all remaining task deadlines by {days_extension} days',
            performance_metric='pace_ratio',
            performance_threshold=0.8,
            actual_performance=data.get('pace_ratio', 0)
        )


__all__ = ['StudyPlanGenerationService', 'StudyPlanAdjustmentService']
