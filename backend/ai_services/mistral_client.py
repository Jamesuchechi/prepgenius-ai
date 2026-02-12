
import os
import json
import logging
from django.conf import settings
from mistralai import Mistral
from mistralai.models import UserMessage, SystemMessage

logger = logging.getLogger(__name__)

class MistralClient:
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        self.model = settings.MISTRAL_MODEL or "mistral-small-latest"
        
        if not self.api_key:
            logger.warning("MISTRAL_API_KEY is not set.")
            self.client = None
        else:
            self.client = Mistral(api_key=self.api_key)

    def generate_questions(self, topic, difficulty, count=5, q_type="MCQ", additional_context=""):
        if not self.client:
            raise ValueError("Mistral API key not configured")

        prompt = self._build_prompt(topic, difficulty, count, q_type, additional_context)
        
        try:
            messages = [
                SystemMessage(content="You are an expert exam question generator. Output ONLY valid JSON."),
                UserMessage(content=prompt)
            ]
            
            chat_response = self.client.chat.complete(
                model=self.model,
                messages=messages,
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            response_content = chat_response.choices[0].message.content
            return self._parse_response(response_content)
            
        except Exception as e:
            logger.error(f"Error generating questions with Mistral: {e}")
            raise

    def generate_response(self, prompt, system_prompt=None, temperature=0.7, max_tokens=1024):
        """Standard chat completion response."""
        if not self.client:
            raise ValueError("Mistral API key not configured")

        try:
            messages = []
            if system_prompt:
                messages.append(SystemMessage(content=system_prompt))
            messages.append(UserMessage(content=prompt))

            chat_response = self.client.chat.complete(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return chat_response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating chat response with Mistral: {e}")
            raise

    def stream_response(self, prompt, system_prompt=None, temperature=0.7, max_tokens=1024):
        """Streaming chat completion response."""
        if not self.client:
            raise ValueError("Mistral API key not configured")

        try:
            messages = []
            if system_prompt:
                messages.append(SystemMessage(content=system_prompt))
            messages.append(UserMessage(content=prompt))

            stream_response = self.client.chat.stream(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            for chunk in stream_response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
            
        except Exception as e:
            logger.error(f"Error streaming chat response with Mistral: {e}")
            raise

    def _build_prompt(self, topic, difficulty, count, q_type, context):
        from .prompts import PromptTemplates
        return PromptTemplates.get_question_prompt(topic, difficulty, count, q_type, context)

    def _parse_response(self, response_text):
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse Mistral response: {response_text}")
            raise ValueError("Invalid JSON response from Mistral AI")
