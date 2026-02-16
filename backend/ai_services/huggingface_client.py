
import os
import json
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class HuggingFaceClient:
    def __init__(self):
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.model = settings.HUGGINGFACE_MODEL or "meta-llama/Meta-Llama-3-8B-Instruct"
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"
        
        if not self.api_key:
            logger.warning("HUGGINGFACE_API_KEY is not set.")

    def generate_questions(self, topic, difficulty, count=5, q_type="MCQ", additional_context=""):
        if not self.api_key:
             raise ValueError("HuggingFace API key not configured")

        prompt = self._build_prompt(topic, difficulty, count, q_type, additional_context)
        
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "inputs": f"[INST] {prompt} [/INST]", # Simple instruct format
            "parameters": {
                "max_new_tokens": 1024,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=settings.HUGGINGFACE_TIMEOUT)
            response.raise_for_status()
            
            result = response.json()
            # HF returns list of dicts typically
            generated_text = result[0]['generated_text']
            
            return self._parse_response(generated_text)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling HuggingFace API: {e}")
            raise
        except Exception as e:
            logger.error(f"Error generating questions with HuggingFace: {e}")
            raise

    def generate_response(self, prompt, system_prompt=None, temperature=0.7, max_tokens=1024, image_data=None):
        """Standard chat completion response."""
        if not self.api_key:
             raise ValueError("HuggingFace API key not configured")

        # Format prompt with system message if provided
        if system_prompt:
            full_prompt = f"[SYSTEM] {system_prompt} [/SYSTEM] [INST] {prompt} [/INST]"
        else:
            full_prompt = f"[INST] {prompt} [/INST]"
            
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": temperature,
                "return_full_text": False
            }
        }
        
        try:
            response = requests.post(
                self.api_url, 
                headers=headers, 
                json=payload, 
                timeout=getattr(settings, 'HUGGINGFACE_TIMEOUT', 30)
            )
            response.raise_for_status()
            
            result = response.json()
            return result[0]['generated_text']
            
        except Exception as e:
            logger.error(f"Error generating chat response with HuggingFace: {e}")
            raise

    def generate_study_plan(self, exam_type, subjects, days_available, difficulty_level, daily_hours, weekly_days):
        """Generates a structured study plan using HuggingFace API."""
        if not self.api_key:
             raise ValueError("HuggingFace API key not configured")

        from .prompts import PromptTemplates
        prompt = PromptTemplates.get_study_plan_prompt(
            exam_type, subjects, days_available, difficulty_level, daily_hours, weekly_days
        )
        # Enforce JSON for open models
        prompt = f"{prompt}\n\nIMPORTANT: Output ONLY the JSON object. Do not add any markdown formatting or explanation."
        
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "inputs": f"[INST] {prompt} [/INST]",
            "parameters": {
                "max_new_tokens": 1024,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            generated_text = result[0]['generated_text']
            
            return self._parse_response(generated_text)
        except Exception as e:
            logger.error(f"Error generating study plan with HuggingFace: {e}")
            raise

    def _build_prompt(self, topic, difficulty, count, q_type, context):
        from .prompts import PromptTemplates
        # Adding explicit JSON enforcement instruction for open models
        base = PromptTemplates.get_question_prompt(topic, difficulty, count, q_type, context)
        return f"{base}\n\nIMPORTANT: Output ONLY the JSON object. Do not add any markdown formatting or explanation."

    def _parse_response(self, response_text):
        try:
            # Cleanup potential markdown
            text = response_text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            
            return json.loads(text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse HuggingFace response: {response_text}")
            raise ValueError("Invalid JSON response from HuggingFace")
