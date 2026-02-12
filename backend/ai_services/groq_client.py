import os
import json
import logging
from django.conf import settings
from groq import Groq

logger = logging.getLogger(__name__)

class GroqClient:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        if not self.api_key:
            logger.warning("GROQ_API_KEY is not set.")
        self.client = Groq(api_key=self.api_key)
        self.model = settings.GROQ_MODEL
        self.timeout = settings.GROQ_TIMEOUT

    def generate_questions(self, topic, difficulty, count=5, q_type="MCQ", additional_context=""):
        """
        Generates questions using Groq API.
        
        Args:
            topic (str): The topic to generate questions for.
            difficulty (str): Difficulty level (EASY, MEDIUM, HARD).
            count (int): Number of questions to generate.
            q_type (str): Type of question (MCQ, THEORY, etc.).
            additional_context (str): Any extra instructions.
            
        Returns:
            list: A list of generated questions in JSON format.
        """
        prompt = self._build_prompt(topic, difficulty, count, q_type, additional_context)
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert exam question generator for Nigerian students (JAMB, WAEC, NECO). Output ONLY valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                temperature=0.7,
                response_format={"type": "json_object"},
                timeout=self.timeout
            )
            
            response_content = chat_completion.choices[0].message.content
            return self._parse_response(response_content)
            
            return self._parse_response(response_content)
            
        except Exception as e:
            logger.error(f"Error generating questions with Groq: {e}")
            raise

    def generate_topics(self, subject):
        """
        Generates topics for a subject using Groq API.
        """
        from .prompts import PromptTemplates
        prompt = PromptTemplates.get_topic_generator_prompt(subject)
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert curriculum planner for Nigerian students. Output ONLY valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=self.model,
                temperature=0.7,
                response_format={"type": "json_object"},
                timeout=self.timeout
            )
            
            response_content = chat_completion.choices[0].message.content
            return self._parse_response(response_content)
        except Exception as e:
            logger.error(f"Error generating topics with Groq: {e}")
            raise

    def _build_prompt(self, topic, difficulty, count, q_type, context):
        from .prompts import PromptTemplates
        return PromptTemplates.get_question_prompt(topic, difficulty, count, q_type, context)

    def _parse_response(self, response_text):
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse Groq response: {response_text}")
            raise ValueError("Invalid JSON response from AI")

    def generate_response(self, prompt, system_prompt=None, temperature=0.7, max_tokens=1024):
        """
        Generates a chat response using Groq API.
        """
        try:
            messages = []
            
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            
            messages.append({
                "role": "user",
                "content": prompt
            })
            
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=self.timeout
            )
            
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating response with Groq: {e}")
            raise
