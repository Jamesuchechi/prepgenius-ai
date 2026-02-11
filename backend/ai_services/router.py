
import logging
from .groq_client import GroqClient
from .mistral_client import MistralClient
from .cohere_client import CohereClient
from .huggingface_client import HuggingFaceClient

logger = logging.getLogger(__name__)

class AIRouter:
    def __init__(self):
        # Initialize clients in priority order
        self.clients = [
            ("Groq", GroqClient()),
            ("Mistral", MistralClient()),
            ("Cohere", CohereClient()),
            ("HuggingFace", HuggingFaceClient())
        ]

    def generate_questions(self, topic, difficulty, count=5, q_type="MCQ", additional_context=""):
        errors = []
        
        for name, client in self.clients:
            try:
                # Skip clients that weren't initialized properly (e.g. missing API key)
                # Assuming clients might be None or have internal checks
                if hasattr(client, 'client') and client.client is None:
                     # Check specific to how we implemented clients. 
                     # Groq, Mistral, Cohere set self.client = None if key missing
                     continue
                
                # HuggingFace check
                if isinstance(client, HuggingFaceClient) and not client.api_key:
                    continue

                logger.info(f"Attempting question generation with {name}...")
                return client.generate_questions(topic, difficulty, count, q_type, additional_context)
                
            except Exception as e:
                logger.warning(f"{name} failed: {e}")
                errors.append(f"{name}: {str(e)}")
                continue
        
        # If we get here, all clients failed
        error_msg = f"All AI providers failed. Errors: {'; '.join(errors)}"
        logger.error(error_msg)
        raise Exception(error_msg)

    def generate_topics(self, subject):
        errors = []
        for name, client in self.clients:
            try:
                if hasattr(client, 'client') and client.client is None:
                    continue
                
                # HuggingFace check
                if isinstance(client, HuggingFaceClient) and not client.api_key:
                    continue

                logger.info(f"Attempting topic generation for '{subject}' with {name}...")
                # Ensure the client has the method before calling
                if hasattr(client, 'generate_topics'):
                    return client.generate_topics(subject)
                else:
                    logger.warning(f"{name} client does not support topic generation.")
                
            except Exception as e:
                logger.warning(f"{name} failed to generate topics: {e}")
                errors.append(f"{name}: {str(e)}")
                continue

        error_msg = f"All AI providers failed to generate topics. Errors: {'; '.join(errors)}"
        logger.error(error_msg)
        raise Exception(error_msg)
    def generate_study_plan(self, exam_type, subjects, days_available, difficulty_level, daily_hours, weekly_days):
        """Generate a study plan using AI providers."""
        errors = []
        
        prompt = f"""Create a structured study plan with the following requirements:
Exam Type: {exam_type}
Subjects: {', '.join(subjects)}
Days Available: {days_available}
Daily Study Hours: {daily_hours}
Weekly Study Days: {weekly_days}
Difficulty Level: {difficulty_level}

Return a JSON response with:
- topic_sequence: list of topics to study in order with estimated hours each
- revision_schedule: recommended revision topics
- study_pace: recommended daily schedule structure
"""
        
        for name, client in self.clients:
            try:
                if hasattr(client, 'client') and client.client is None:
                    continue
                
                # HuggingFace check
                if isinstance(client, HuggingFaceClient) and not client.api_key:
                    continue

                logger.info(f"Attempting study plan generation with {name}...")
                # Use generate_questions with study plan context as fallback
                if hasattr(client, 'generate_study_plan'):
                    return client.generate_study_plan(exam_type, subjects, days_available, difficulty_level, daily_hours, weekly_days)
                else:
                    # Fallback to generating a high-level response
                    logger.debug(f"{name} client does not support direct study plan generation, using fallback.")
                    continue
                
            except Exception as e:
                logger.warning(f"{name} failed to generate study plan: {e}")
                errors.append(f"{name}: {str(e)}")
                continue
        
        logger.warning(f"AI-based study plan generation failed. Using template-based approach. Errors: {'; '.join(errors)}")
        return None  # Return None to trigger template-based generation