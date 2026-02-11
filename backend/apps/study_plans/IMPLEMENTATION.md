# Study Plans App - Implementation Guide

## Overview

This document provides a comprehensive guide to the Study Plans app implementation for PrepGenius AI. The Study Plans feature enables personalized study plan generation powered by AI, comprehensive scheduling, task management, and performance-based adjustments.

## Implementation Summary

The Study Plans app has been fully implemented with the following components:

### 1. **Database Models** (`models.py`)

#### StudyPlan
- User's main study plan entity
- Fields: user, exam_type, subjects, status, exam_date, estimated completion date
- Supports AI-generated and custom plans
- Tracks progress and completion metrics
- Includes AI generation metadata (provider, confidence score, prompt)

#### StudyTask
- Individual topics/tasks within a study plan
- Fields: study_plan, subject, topic, scheduled dates, priority, difficulty
- Tracks time spent, understanding level, completion percentage
- Supports task repetition and reinforcement
- Includes reminders and resource links

#### StudyReminder
- Reminder/notification system for tasks and daily goals
- Types: task_start, task_deadline, weak_topic, daily_goal
- Frequency: one_time, daily, weekly
- Tracks sent status and next send time

#### AdjustmentHistory
- Audit trail of plan adjustments
- Tracks what changed, why, and when
- Linked to performance metrics that triggered adjustment

### 2. **API Endpoints** (`views.py`)

#### Study Plans
- `POST /api/study-plans/generate/` - Generate AI study plan
- `GET /api/study-plans/` - List all plans
- `GET /api/study-plans/current/` - Get active plan
- `GET /api/study-plans/{id}/` - Get plan details
- `PATCH /api/study-plans/{id}/` - Update plan
- `POST /api/study-plans/{id}/activate/` - Activate a plan
- `POST /api/study-plans/{id}/pause/` - Pause plan
- `POST /api/study-plans/{id}/resume/` - Resume plan
- `GET /api/study-plans/{id}/statistics/` - Get plan statistics
- `POST /api/study-plans/{id}/adjust/` - Request performance adjustment

#### Study Tasks
- `GET /api/study-tasks/` - List tasks
- `GET /api/study-tasks/{id}/` - Get task details
- `PATCH /api/study-tasks/{id}/` - Update task
- `POST /api/study-tasks/{id}/start/` - Start task
- `POST /api/study-tasks/{id}/complete/` - Mark as complete
- `POST /api/study-tasks/{id}/log-session/` - Log study session
- `POST /api/study-tasks/{id}/skip/` - Skip task
- `GET /api/study-tasks/pending/` - List pending tasks
- `GET /api/study-tasks/overdue/` - List overdue tasks

#### Reminders
- `GET /api/reminders/` - List reminders
- `GET /api/reminders/pending/` - Get pending reminders
- `POST /api/reminders/{id}/mark_sent/` - Mark reminder as sent

### 3. **AI Study Plan Generation** (`services.py`)

#### StudyPlanGenerationService
Handles intelligent study plan generation using AI:
- Accepts user profile, exam info, subjects, and preferences
- Uses AIRouter to generate optimal topic sequence
- Creates study schedule with intelligent task distribution
- Generates learning objectives for each task
- Creates reminders automatically
- Handles edge cases (exam dates, available time, learning pace)

**Key Features:**
- AI-powered topic sequencing
- Dynamic hour allocation based on exam proximity
- Revision scheduling (last 25% of tasks)
- Priority assignment based on topic sequence
- Learning pace detection
- Weak topic identification and focus

#### StudyPlanAdjustmentService
Adjusts plans based on performance:
- Increases difficulty for high performers (>85% mastery)
- Decreases difficulty for struggling users (<40% mastery)
- Adjusts pace (accelerate if ahead, extend if behind)
- Extends deadlines when needed
- Creates adjustment audit trail

### 4. **Background Tasks** (`tasks.py`)

Celery tasks for asynchronous operations:
- `send_study_reminders()` - Send pending reminders (runs every 15 mins)
- `update_study_plan_progress()` - Update all active plans (daily)
- `detect_overdue_tasks()` - Find and track overdue tasks (daily)
- `generate_daily_study_reminders()` - Create daily goal reminders (daily)
- `send_exam_countdown_reminder()` - Send 7-day countdown (daily)

### 5. **Data Serialization** (`serializers.py`)

Comprehensive serializers for API responses:
- `StudyPlanListSerializer` - Simplified for listings
- `StudyPlanDetailedSerializer` - Full details with nested data
- `StudyPlanCreateSerializer` - For POST requests
- `StudyPlanUpdateSerializer` - For PATCH requests
- `StudyTaskSerializer` - Full task details
- `StudyTaskCreateSerializer` - For POST requests
- `StudyTaskUpdateSerializer` - For PATCH requests
- `StudyTaskCompleteSerializer` - For completion endpoint
- `StudySessionLogSerializer` - For logging sessions
- `StudyReminderSerializer` - Reminder details
- `StudyStatisticsSerializer` - Statistics format

### 6. **Admin Interface** (`admin.py`)

Full Django admin integration:
- Visual progress bars and status badges
- Inline editing of tasks and reminders
- Adjustment history viewing
- Detailed performance metrics display
- Search and filtering by various criteria
- Customizable list displays

### 7. **Signals** (`signals.py`)

Automatic event handlers:
- Update plan progress when tasks change
- Send completion notifications
- Initialize plans on creation
- Log adjustment notifications
- Email notifications for completions and adjustments

### 8. **Testing** (`tests.py`)

Comprehensive test suite:
- Model tests (creation, calculations, methods)
- API endpoint tests (GET, POST, PATCH)
- Service tests (plan generation, adjustments)
- Integration tests
- Permission and authentication tests

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
python manage.py makemigrations study_plans
python manage.py migrate study_plans
```

### 3. Create Superuser (if needed)

```bash
python manage.py createsuperuser
```

### 4. Start Development Server

```bash
python manage.py runserver
```

### 5. Configure Celery (for background tasks)

```bash
# In another terminal
celery -A core worker -l info

# For periodic tasks
celery -A core beat -l info
```

## Usage Examples

### Python/Django

```python
from apps.study_plans.services import StudyPlanGenerationService
from apps.content.models import ExamType, Subject
from django.utils import timezone
from datetime import timedelta

# Generate study plan
service = StudyPlanGenerationService()
exam_type = ExamType.objects.get(name='JAMB')
subjects = Subject.objects.filter(name__in=['Mathematics', 'English'])

study_plan, tasks = service.generate_study_plan(
    user=request.user,
    exam_type=exam_type,
    exam_date=timezone.now().date() + timedelta(days=90),
    subjects=subjects,
    study_hours_per_day=2.5,
    study_days_per_week=6,
    difficulty_preference='intermediate',
    include_weekends=True
)

# Mark task as completed
task = study_plan.tasks.first()
task.mark_completed(understanding_level=85, notes='Great understanding')

# Log study session
task.add_study_session(3600, understanding_level=80)

# Adjust based on performance
from apps.study_plans.services import StudyPlanAdjustmentService

adjustment = StudyPlanAdjustmentService.adjust_plan_for_performance(
    study_plan=study_plan,
    performance_data={'mastery_score': 88}
)
```

### REST API

```bash
# Generate study plan
curl -X POST http://localhost:8000/api/study-plans/generate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exam_type_id": 1,
    "exam_date": "2025-04-15",
    "subject_ids": [1, 2, 3],
    "study_hours_per_day": 2.5,
    "study_days_per_week": 6,
    "difficulty_preference": "intermediate"
  }'

# Get current plan
curl http://localhost:8000/api/study-plans/current/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark task as completed
curl -X POST http://localhost:8000/api/study-tasks/1/complete/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "understanding_level": 85,
    "notes": "Completed all practice questions"
  }'

# Log study session
curl -X POST http://localhost:8000/api/study-tasks/1/log-session/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "duration_seconds": 3600,
    "understanding_level": 80
  }'

# Get plan statistics
curl http://localhost:8000/api/study-plans/1/statistics/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Request performance-based adjustment
curl -X POST http://localhost:8000/api/study-plans/1/adjust/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "behind_schedule",
    "details": "Unable to keep up with current pace"
  }'
```

## Key Features

### 1. AI-Powered Generation
- Analyzes user profile (previous performance, learning pace)
- Generates optimal topic sequence
- Allocates study hours intelligently
- Creates revision schedule

### 2. Intelligent Scheduling
- Respects user preferences (hours/day, days/week)
- Considers exam date
- Handles weekends
- Dynamic duration calculation

### 3. Performance Tracking
- Records time spent per task
- Tracks understanding level
- Monitors completion percentage
- Detects overdue tasks

### 4. Adaptive Adjustment
- Increases difficulty for high performers
- Decreases difficulty for struggling students
- Adjusts pace based on progress
- Extends deadlines when needed

### 5. Reminder System
- Task start reminders
- Deadline reminders
- Daily goal reminders
- Exam countdown reminders
- Configurable frequency

### 6. Progress Analytics
- Completion percentage
- Average daily hours
- Topics completed/pending/in-progress
- Days until exam
- Average understanding level

## Architecture

```
study_plans/
├── models.py                 # Database models
├── views.py                  # API ViewSets
├── serializers.py            # DRF Serializers
├── services.py               # Business logic
├── tasks.py                  # Celery tasks
├── signals.py                # Django signals
├── admin.py                  # Admin interface
├── urls.py                   # URL patterns
├── apps.py                   # App config
├── tests.py                  # Test suite
└── __init__.py
```

## Integration Points

### Content App
- References subjects and topics
- Uses exam types for plan targeting

### Analytics App
- Accesses ProgressTracker and TopicMastery
- Determines weak/mastered subjects
- Uses for performance-based adjustments

### AI Services
- Uses AIRouter for study plan generation
- Leverages multiple AI providers (Groq, Mistral, Cohere, HuggingFace)

### Accounts App
- Links to User model
- Uses for authentication and authorization

## Performance Considerations

1. **Database Indexing**
   - Indexed on user + created_at
   - Indexed on status fields
   - Indexed on exam_date

2. **Query Optimization**
   - Uses select_related for foreign keys
   - Uses prefetch_related for reverse relations
   - Caches progress calculations

3. **Background Processing**
   - Reminders sent via Celery
   - Progress updates asynchronous
   - Email notifications non-blocking

## Security

1. **Authentication**: JWT tokens required
2. **Authorization**: Users can only access their own plans
3. **Data Validation**: All inputs validated
4. **Rate Limiting**: Applied to API endpoints
5. **Error Handling**: Comprehensive error responses

## Future Enhancements

1. **Mobile App Integration**
   - Push notifications for reminders
   - Offline study session logging

2. **Advanced Analytics**
   - Predictive performance modeling
   - Personalized learning path optimization
   - Peer comparison anonymously

3. **Social Features**
   - Study group formation
   - Study plan sharing
   - Performance leaderboards

4. **Gamification Integration**
   - Achievement badges for completed plans
   - Streak rewards
   - Study plan milestones

5. **AI Enhancements**
   - Real-time difficulty adjustment
   - Contextual study recommendations
   - Automated weak area detection

## Troubleshooting

### Study Plan Generation Fails
- Check AI service availability
- Verify exam date is in future
- Ensure subjects exist in database

### Reminders Not Sending
- Verify Celery worker is running
- Check Django email configuration
- Review Celery logs

### Performance Issues
- Run migrations for proper indexing
- Enable query caching
- Monitor database connection pooling

## Support

For issues or questions:
1. Check error logs: `logs/django.log`
2. Review test cases: `apps/study_plans/tests.py`
3. Check admin interface for data integrity
4. Review API documentation in docstrings

---

**Implementation Date**: February 11, 2026  
**Status**: ✅ Complete and Ready for Testing
