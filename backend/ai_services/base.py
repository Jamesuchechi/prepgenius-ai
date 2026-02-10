import abc
import requests
import json
from django.conf import settings
from typing import Dict, Any, Optional

class BaseAIClient(abc.ABC):

    """Abstract base class for AI clients."""
    
    @abc.abstractmethod
    def generate_response(self, prompt: str, system_prompt: str = None, **kwargs) -> Optional[str]:
        """Generates a text response from the AI model."""
        pass

class GroqClient(BaseAIClient):
    def generate_response(self, prompt: str, system_prompt: str = None, **kwargs) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        data = {
            "model": settings.GROQ_MODEL or "gemma2-9b-it",
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
            "max_tokens": kwargs.get("max_tokens", 1024),
        }

        try:
            # Groq API requires openai/v1 path
            base_url = settings.GROQ_BASE_URL.rstrip('/')
            if "/openai" not in base_url:
                if base_url.endswith("/v1"):
                    base_url = base_url.replace("/v1", "/openai/v1")
                else:
                    base_url = f"{base_url}/openai/v1"
            
            url = f"{base_url}/chat/completions"
            
            response = requests.post(url, headers=headers, json=data, timeout=settings.GROQ_TIMEOUT)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            # In production we might want to log this to a real logger
            return None

class MistralClient(BaseAIClient):
    def generate_response(self, prompt: str, system_prompt: str = None, **kwargs) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        data = {
            "model": settings.MISTRAL_MODEL or "mistral-small-latest", # Fallback default
            "messages": messages,
            "temperature": kwargs.get("temperature", 0.7),
        }

        try:
            response = requests.post(f"{settings.MISTRAL_BASE_URL}/chat/completions", headers=headers, json=data, timeout=settings.MISTRAL_TIMEOUT)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            return None

class HuggingFaceClient(BaseAIClient):
    def generate_response(self, prompt: str, system_prompt: str = None, **kwargs) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # HF Inference API often takes just string input for text-generation, or specific inputs for chat
        # Assuming we use a text-generation or conversational model. 
        # For simplicity and broad compatibility with instruction tuned models, we'll format the prompt.
        
        final_prompt = prompt
        if system_prompt:
             final_prompt = f"System: {system_prompt}\nUser: {prompt}"

        data = {
            "inputs": final_prompt,
            "parameters": {
                "max_new_tokens": kwargs.get("max_tokens", 1024),
                "temperature": kwargs.get("temperature", 0.7),
                "return_full_text": False
            }
        }

        url = f"{settings.HUGGINGFACE_BASE_URL}/models/{settings.HUGGINGFACE_MODEL}"

        try:
            response = requests.post(url, headers=headers, json=data, timeout=settings.HUGGINGFACE_TIMEOUT)
            response.raise_for_status()
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                 return result[0].get("generated_text")
            return None # Unexpected format
        except Exception as e:
            print(f"HuggingFace API Error: {e}")
            return None

class CohereClient(BaseAIClient):
    def generate_response(self, prompt: str, system_prompt: str = None, **kwargs) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {settings.COHERE_API_KEY}",
            "Content-Type": "application/json",
             "Request-Source": "python-client"
        }
        
        data = {
            "message": prompt,
            "model": settings.COHERE_MODEL or "command",
            "temperature": kwargs.get("temperature", 0.7),
             "preamble": system_prompt
        }

        try:
            response = requests.post(f"{settings.COHERE_BASE_URL}/chat", headers=headers, json=data, timeout=settings.COHERE_TIMEOUT)
            response.raise_for_status()
            return response.json().get("text")
        except Exception as e:
            print(f"Cohere API Error: {e}")
            return None
