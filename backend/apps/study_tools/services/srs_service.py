from datetime import timedelta
from django.utils import timezone
from apps.study_tools.models import Flashcard, FlashcardReviewLog
from apps.questions.models import QuestionAttempt

class SRSService:
    """
    Service for managing Spaced Repetition (SM-2 Algorithm).
    """

    @staticmethod
    def update_flashcard_srs(flashcard, rating):
        """
        Updates flashcard metadata based on SM-2 algorithm.
        Rating: 0 (Again), 1 (Hard), 2 (Good), 3 (Easy)
        For calculation, we map these to SM-2 range (0-5) or use a simplified version.
        Simplified SM-2:
        0 (Again): Repeat today
        1 (Hard): Repeat soon
        2 (Good): Standard interval increase
        3 (Easy): Aggressive interval increase
        """
        old_interval = flashcard.interval
        old_ease_factor = flashcard.ease_factor
        
        # Map ratings to SM-2 equivalent (0-5)
        # 0: Again -> 0 (Total failure)
        # 1: Hard -> 2 (Incorrect, but easy to recall)
        # 2: Good -> 4 (Correct, with hesitation)
        # 3: Easy -> 5 (Correct, perfect recall)
        sm2_rating = {0: 0, 1: 2, 2: 4, 3: 5}.get(rating, 3)

        if sm2_rating >= 3:  # Correct
            if flashcard.repetitions == 0:
                flashcard.interval = 1
            elif flashcard.repetitions == 1:
                flashcard.interval = 6
            else:
                flashcard.interval = round(flashcard.interval * flashcard.ease_factor)
            
            flashcard.repetitions += 1
        else:  # Incorrect
            flashcard.repetitions = 0
            flashcard.interval = 1

        # Update Ease Factor: EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        flashcard.ease_factor = max(1.3, flashcard.ease_factor + (0.1 - (5 - sm2_rating) * (0.08 + (5 - sm2_rating) * 0.02)))
        
        flashcard.next_review = timezone.now().date() + timedelta(days=flashcard.interval)
        flashcard.save()

        # Log the review
        FlashcardReviewLog.objects.create(
            flashcard=flashcard,
            rating=rating,
            old_interval=old_interval,
            old_ease_factor=old_ease_factor,
            new_interval=flashcard.interval,
            new_ease_factor=flashcard.ease_factor
        )
        return flashcard

    @staticmethod
    def auto_generate_from_mistake(user, question_attempt):
        """
        Creates a flashcard from a failed question attempt.
        """
        if question_attempt.is_correct:
            return None

        question = question_attempt.question
        
        # Check if a flashcard for this question already exists for this user
        # (We can use a hash of the content or the question ID in metadata if we had it)
        # For now, let's just create it if it's a new mistake session
        
        front = question.content
        
        # Collect correct answers for the back of the card
        correct_answers = question.answers.filter(is_correct=True)
        back = "Correct Answer(s):\n" + "\n".join([f"- {a.content}" for a in correct_answers])
        
        if question.guidance:
            back += f"\n\nExplanation:\n{question.guidance}"
            
        flashcard = Flashcard.objects.create(
            user=user,
            subject=question.subject,
            topic=question.topic,
            front=front,
            back=back,
            source_type='exam_mistake'
        )
        return flashcard
