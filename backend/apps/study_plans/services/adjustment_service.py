
import logging
from typing import Dict, Optional
from datetime import timedelta, date
from django.utils import timezone
from django.db.models import Q

from ..models import StudyPlan, StudyTask, AdjustmentHistory
from apps.analytics.models import TopicMastery, SpacedRepetitionItem

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
    def trigger_adaptive_review(study_plan: StudyPlan) -> int:
        """
        Check for mastery drops or spaced repetition needs and create review tasks.
        
        Returns:
            Number of review tasks created
        """
        user = study_plan.user
        tasks_created = 0
        
        # 1. Check for topics needing spaced repetition
        today = timezone.now().date()
        due_items = SpacedRepetitionItem.objects.filter(
            user=user,
            next_review_date__lte=today
        )
        
        topic_names_due = set(due_items.values_list('topic', flat=True))
        
        # 2. Check for weak topics (< 60% mastery)
        weak_masteries = TopicMastery.objects.filter(
            user=user,
            mastery_score__lt=60.0,
            quizzes_taken__gt=0
        )
        
        topic_names_weak = set(weak_masteries.values_list('topic', flat=True))
        
        # Combine topics needing review
        review_topics = topic_names_due.union(topic_names_weak)
        
        if not review_topics:
            return 0
            
        # Get actual Topic objects for these names
        # We need to map strings back to Topic objects if they were previously in the plan
        # or relevant to the subjects in the plan
        for topic_name in review_topics:
            # Check if there is an active review task already
            existing_review = StudyTask.objects.filter(
                study_plan=study_plan,
                topic__name=topic_name,
                status__in=['pending', 'in_progress'],
                description__icontains="Review"
            ).exists()
            
            if not existing_review:
                # Find the Topic object
                from apps.content.models import Topic
                topic = Topic.objects.filter(name=topic_name, subject__in=study_plan.subjects.all()).first()
                
                if topic:
                    StudyPlanAdjustmentService._create_review_task(study_plan, topic)
                    tasks_created += 1
                    
        return tasks_created

    @staticmethod
    def _create_review_task(study_plan: StudyPlan, topic) -> StudyTask:
        """Helper to create a high-priority review task."""
        today = timezone.now().date()
        
        return StudyTask.objects.create(
            study_plan=study_plan,
            subject=topic.subject,
            topic=topic,
            scheduled_start_date=today,
            scheduled_end_date=today + timedelta(days=2),
            estimated_duration_hours=1.0,
            description=f"Review: {topic.name} (Performance-based)",
            learning_objectives=[f"Re-consolidate knowledge of {topic.name}", "Identify and bridge gaps"],
            status='pending',
            priority='high',
            difficulty_level='beginner',
            is_repeatable=True
        )
    
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
