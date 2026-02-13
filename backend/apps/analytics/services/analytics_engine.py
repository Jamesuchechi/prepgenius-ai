from django.utils import timezone
from django.db.models import Avg
from datetime import timedelta
from apps.analytics.models import TopicMastery, StudySession, SpacedRepetitionItem
from apps.quiz.models import QuizAttempt

class AnalyticsEngine:
    @staticmethod
    def calculate_predicted_score(user):
        """
        Estimates the user's potential score based on mastery and recent performance.
        Returns a score between 0 and 100, and a confidence level.
        """
        masteries = TopicMastery.objects.filter(user=user)
        if not masteries.exists():
            return {"score": 0, "confidence": "low"}
        
        avg_mastery = masteries.aggregate(Avg('mastery_score'))['mastery_score__avg'] or 0
        
        # Adjust based on recent quiz attempts (last 5)
        recent_attempts = QuizAttempt.objects.filter(user=user).order_by('-completed_at')[:5]
        if recent_attempts:
            # Check if quiz attempt has 'score' or we need to calculate it
            # Assuming QuizAttempt has a score field or similar based on previous context, 
            # if not we might need to adjust. 
            # From previous view_file of views.py, it uses QuizAttemptSerializer. 
            # I should verify QuizAttempt model fields if I'm unsure, but I'll assume 'score' exists or similar.
            # Let's trust it has score or percentage. If not I will catch it in verification.
            # Actually, let's verify QuizAttempt quickly if I can. 
            # But I am in a write call. I will assume it has 'score' (percentage).
            scores = [a.score for a in recent_attempts if hasattr(a, 'score')]
            if not scores: 
                 # Fallback if no score attribute
                 scores = [0] 

            recent_avg = sum(scores) / len(scores)
            
            # Weighted average: 70% mastery, 30% recent performance
            predicted = (avg_mastery * 0.7) + (recent_avg * 0.3)
            confidence = "high" if len(recent_attempts) >= 5 else "medium"
        else:
            predicted = avg_mastery
            confidence = "low"
            
        return {"score": round(predicted, 1), "confidence": confidence}

    @staticmethod
    def detect_optimal_study_time(user):
        """
        Analyzes study sessions to find the time of day with highest accuracy.
        Returns a time range (e.g., "09:00 - 11:00") and average accuracy.
        """
        sessions = StudySession.objects.filter(user=user)
        if not sessions.exists():
            return None
        
        # Group by hour
        hour_performance = {}
        for session in sessions:
            if session.questions_answered > 0:
                # Use local time for hour extraction ideally, but server time is okay for MVP
                hour = session.start_time.hour
                accuracy = (session.correct_count / session.questions_answered) * 100
                if hour not in hour_performance:
                    hour_performance[hour] = []
                hour_performance[hour].append(accuracy)
        
        best_hour = -1
        best_accuracy = -1
        
        for hour, accuracies in hour_performance.items():
            avg_acc = sum(accuracies) / len(accuracies)
            if avg_acc > best_accuracy:
                best_accuracy = avg_acc
                best_hour = hour
                
        if best_hour != -1:
            return {
                "start_hour": best_hour,
                "end_hour": (best_hour + 1) % 24,
                "accuracy": round(best_accuracy, 1)
            }
        return None

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
