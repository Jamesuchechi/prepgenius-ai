from django.utils import timezone
from django.db.models import Avg
from datetime import timedelta
from apps.analytics.models import TopicMastery, StudySession, SpacedRepetitionItem, ProgressTracker
from apps.quiz.models import QuizAttempt, AnswerAttempt
from apps.exams.models import ExamAttempt, ExamResult

class AnalyticsEngine:
    @staticmethod
    def calculate_predicted_score(user):
        """
        Estimates the user's potential score based on mastery, quizzes, and mock exams.
        """
        masteries = TopicMastery.objects.filter(user=user)
        avg_mastery = masteries.aggregate(Avg('mastery_score'))['mastery_score__avg'] or 0
        
        # Recent Quiz Performance (last 5)
        recent_quizzes = QuizAttempt.objects.filter(user=user, status='COMPLETED').order_by('-completed_at')[:5]
        quiz_avg = sum([a.score for a in recent_quizzes]) / len(recent_quizzes) if recent_quizzes else avg_mastery
        
        # Recent Mock Exam Performance (last 3)
        recent_exams = ExamResult.objects.filter(attempt__user=user).order_by('-generated_at')[:3]
        exam_avg = sum([r.percentage for r in recent_exams]) / len(recent_exams) if recent_exams else quiz_avg
        
        # Weighted Prediction: 50% Exams, 30% Quizzes, 20% Mastery
        if recent_exams:
            predicted = (exam_avg * 0.5) + (quiz_avg * 0.3) + (avg_mastery * 0.2)
            confidence = "high" if len(recent_exams) >= 3 else "medium"
        elif recent_quizzes:
            predicted = (quiz_avg * 0.7) + (avg_mastery * 0.3)
            confidence = "medium"
        else:
            predicted = avg_mastery
            confidence = "low"
            
        return {"score": round(predicted, 1), "confidence": confidence}

    @staticmethod
    def detect_optimal_study_time(user):
        """
        Analyzes study sessions and quiz attempts to find the most productive time.
        """
        sessions = StudySession.objects.filter(user=user)
        quizzes = QuizAttempt.objects.filter(user=user, status='COMPLETED')
        
        performance_data = []
        for s in sessions:
            if s.questions_answered > 0:
                performance_data.append((s.start_time.hour, (s.correct_count / s.questions_answered) * 100))
        
        for q in quizzes:
            if q.total_questions > 0:
                performance_data.append((q.started_at.hour, (q.correct_answers / q.total_questions) * 100))
        
        if not performance_data:
            return None
        
        hour_map = {}
        for hour, acc in performance_data:
            if hour not in hour_map: hour_map[hour] = []
            hour_map[hour].append(acc)
            
        best_hour = max(hour_map.keys(), key=lambda h: sum(hour_map[h])/len(hour_map[h]))
        avg_acc = sum(hour_map[best_hour]) / len(hour_map[best_hour])
        
        return {
            "start_hour": best_hour,
            "end_hour": (best_hour + 1) % 24,
            "accuracy": round(avg_acc, 1)
        }

    @staticmethod
    def get_recent_activities(user, limit=10):
        """
        Unifies recent quizzes and exams into a single timeline.
        """
        quizzes = QuizAttempt.objects.filter(user=user, status='COMPLETED').order_by('-completed_at')[:limit]
        exams = ExamResult.objects.filter(attempt__user=user).order_by('-generated_at')[:limit]
        
        activities = []
        for q in quizzes:
            activities.append({
                "type": "quiz",
                "title": q.quiz.title,
                "score": q.score,
                "date": q.completed_at,
                "id": f"q_{q.id}"
            })
            
        for e in exams:
            activities.append({
                "type": "exam",
                "title": e.attempt.mock_exam.title,
                "score": e.percentage,
                "date": e.generated_at,
                "id": f"e_{e.id}"
            })
            
        return sorted(activities, key=lambda x: x['date'], reverse=True)[:limit]

    @staticmethod
    def get_spaced_repetition_queue(user):
        """
        Returns a list of items due for review today.
        """
        today = timezone.localtime().date()
        due_items = SpacedRepetitionItem.objects.filter(
            user=user, 
            next_review_date__lte=today
        ).order_by('next_review_date')
        return due_items
    
    @staticmethod
    def update_spaced_repetition(user, topic, performance_rating):
        """
        Updates the SM-2 parameters for a topic based on performance (0-5).
        0-2: Fail, 3-5: Pass
        """
        item, created = SpacedRepetitionItem.objects.get_or_create(
            user=user, 
            topic=topic,
            defaults={'next_review_date': timezone.localtime().date()}
        )
        
        if performance_rating >= 3:
            if item.repetitions == 0:
                item.interval = 1
            elif item.repetitions == 1:
                item.interval = 6
            else:
                item.interval = int(item.interval * item.ease_factor)
            
            item.repetitions += 1
            item.ease_factor = max(1.3, item.ease_factor + (0.1 - (5 - performance_rating) * (0.08 + (5 - performance_rating) * 0.02)))
        else:
            item.repetitions = 0
            item.interval = 1
            
        item.next_review_date = timezone.localtime().date() + timedelta(days=item.interval)
        item.save()
        return item
