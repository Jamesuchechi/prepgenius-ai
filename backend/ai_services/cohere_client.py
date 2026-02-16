
import os
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class CohereClient:
    def __init__(self):
        import cohere
        self.api_key = settings.COHERE_API_KEY
        self.model = settings.COHERE_MODEL or "command-r-plus-08-2024"
        
        if not self.api_key:
            logger.warning("COHERE_API_KEY is not set.")
            self.client = None
        else:
            self.client = cohere.Client(self.api_key)

    def generate_questions(self, topic, difficulty, count=5, q_type="MCQ", additional_context=""):
        if not self.client:
            raise ValueError("Cohere API key not configured")

        prompt = self._build_prompt(topic, difficulty, count, q_type, additional_context)
        
        try:
            # Cohere doesn't have a JSON mode flag in 'chat', but responds well to instructions
            # 'command-r' models are good at following preamble
            
            response = self.client.chat(
                message=prompt,
                model=self.model,
                preamble="You are an expert exam question generator. You must output ONLY valid JSON.",
                temperature=0.7,
            )
            
            return self._parse_response(response.text)
            
        except Exception as e:
            logger.error(f"Error generating questions with Cohere: {e}")
            raise

    def _build_prompt(self, topic, difficulty, count, q_type, context):
        from .prompts import PromptTemplates
        base = PromptTemplates.get_question_prompt(topic, difficulty, count, q_type, context)
        return f"{base}\n\nStrictly output valid JSON only."

    def _parse_response(self, response_text):
        try:
            text = response_text.strip()
            # Cohere often wraps in ```json ... ```
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
                
            return json.loads(text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse Cohere response: {response_text}")
            raise ValueError("Invalid JSON response from Cohere")

    def generate_response(self, prompt, system_prompt=None, temperature=0.7, max_tokens=1024, image_data=None):
        """Standard chat completion response."""
        if not self.client:
            raise ValueError("Cohere API key not configured")

        try:
            response = self.client.chat(
                message=prompt,
                model=self.model,
                preamble=system_prompt,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating chat response with Cohere: {e}")
            raise

    def stream_response(self, prompt, system_prompt=None, temperature=0.7, max_tokens=1024, image_data=None):
        """Streaming chat completion response."""
        if not self.client:
            raise ValueError("Cohere API key not configured")

        try:
            stream = self.client.chat_stream(
                message=prompt,
                model=self.model,
                preamble=system_prompt,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            for event in stream:
                if event.event_type == "text-generation":
                    yield event.text
            
        except Exception as e:
            logger.error(f"Error streaming chat response with Cohere: {e}")
            raise

    def generate_study_plan(self, exam_type, subjects, days_available, difficulty_level, daily_hours, weekly_days):
        """Generates a structured study plan using Cohere API."""
        if not self.client:
            raise ValueError("Cohere API key not configured")

        from .prompts import PromptTemplates
        prompt = PromptTemplates.get_study_plan_prompt(
            exam_type, subjects, days_available, difficulty_level, daily_hours, weekly_days
        )
        
        try:
            response = self.client.chat(
                message=prompt,
                model=self.model,
                preamble="You are an expert curriculum and study planner for Nigerian students. You must output ONLY valid JSON.",
                temperature=0.7,
            )
            
            return self._parse_response(response.text)
        except Exception as e:
            logger.error(f"Error generating study plan with Cohere: {e}")
            raise

    def generate_embedding(self, text):
        """Generate vector embedding for text."""
        if not self.client:
            raise ValueError("Cohere API key not configured")

        try:
            # Cohere embed API
            response = self.client.embed(
                texts=[text],
                model="embed-english-v3.0", # or make this configurable
                input_type="components"  # correct for RAG content
            )
            return response.embeddings[0]
            
        except Exception as e:
            logger.error(f"Error generating embedding with Cohere: {e}")
            raise
