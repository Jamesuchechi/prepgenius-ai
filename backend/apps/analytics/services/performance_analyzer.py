from django.db.models import Avg
from apps.analytics.models import TopicMastery, ProgressTracker
from apps.exams.models import ExamAttempt, ExamResult
from apps.quiz.models import QuizAttempt
import math

class PerformanceAnalyzer:
    """
    Advanced performance analysis using Exponential Moving Averages (EMA)
    and multi-factor readiness scoring.
    """
    
    @staticmethod
    def calculate_ema_mastery(current_mastery, new_score, smoothing_factor=0.3):
        """
        Calculate new mastery score using EMA.
        Weighs recent performance (smoothing_factor) against historical performance.
        """
        if current_mastery == 0:
            return new_score
        return (new_score * smoothing_factor) + (current_mastery * (1 - smoothing_factor))

    @staticmethod
    def calculate_readiness_score(user):
        """
        Computes a Readiness Score (0-100) combining:
        1. Topic Mastery (Aggregated) - 40%
        2. Exam Trends (Recent performance vs previous) - 30%
        3. Study Consistency (Streak & Time) - 20%
        4. Accuracy Trend - 10%
        """
        # 1. Topic Mastery
        masteries = TopicMastery.objects.filter(user=user)
        avg_mastery = masteries.aggregate(Avg('mastery_score'))['mastery_score__avg'] or 0
        
        # 2. Exam Trends
        recent_exams = ExamResult.objects.filter(attempt__user=user).order_by('-generated_at')[:5]
        if len(recent_exams) >= 2:
            current_avg = sum([e.percentage for e in recent_exams[:2]]) / 2
            trend_slice = recent_exams[2:5]
            if trend_slice:
                prev_avg = sum([e.percentage for e in trend_slice]) / len(trend_slice)
                trend_multiplier = 1.1 if current_avg > prev_avg else 0.9
            else:
                trend_multiplier = 1.0
            exam_score = min(100, current_avg * trend_multiplier)
        elif recent_exams:
            exam_score = recent_exams[0].percentage
        else:
            exam_score = avg_mastery

        # 3. Consistency
        progress, _ = ProgressTracker.objects.get_or_create(user=user)
        streak_bonus = min(15, progress.current_streak * 2) # Max 15 points for streak
        time_bonus = min(5, progress.total_study_minutes / 120) # Max 5 points for 2hrs+ study
        consistency_score = min(100, (avg_mastery * 0.8) + streak_bonus + time_bonus)

        # 4. Accuracy Trend
        accuracy = progress.accuracy_percentage
        
        # Final weighted score
        readiness = (avg_mastery * 0.4) + (exam_score * 0.3) + (consistency_score * 0.2) + (accuracy * 0.1)
        
        return {
            "score": round(readiness, 1),
            "breakdown": {
                "mastery": round(avg_mastery, 1),
                "exam_performance": round(exam_score, 1),
                "consistency": round(consistency_score, 1),
                "accuracy": round(accuracy, 1)
            },
            "interpretation": PerformanceAnalyzer.get_readiness_interpretation(readiness)
        }

    @staticmethod
    def get_readiness_interpretation(score):
        if score >= 85: return "Exam Ready: Excellent mastery and consistency."
        if score >= 70: return "Strong: Good performance, minor focus on weak areas needed."
        if score >= 50: return "Developing: Moderate progress, more practice exams required."
        return "Early Stage: Focus on fundamental topic mastery."

    @staticmethod
    def get_subject_mastery(user):
        """Returns aggregated mastery scores for subjects."""
        masteries = TopicMastery.objects.filter(user=user)
        subject_map = {}
        
        for m in masteries:
            subject = m.subject or "General"
            if subject not in subject_map:
                subject_map[subject] = []
            subject_map[subject].append(m.mastery_score)
            
        return [
            {"subject": sub, "score": round(sum(scores)/len(scores), 1)}
            for sub, scores in subject_map.items()
        ]
