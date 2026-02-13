import logging
from django.conf import settings
import json

logger = logging.getLogger(__name__)

class GroqClient:
    def __init__(self):
        from groq import Groq
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

    def generate_response(self, prompt, system_prompt=None, temperature=0.7, max_tokens=1024, image_data=None):
        """
        Generates a chat response using Groq API.
        Supports multi-modal input (text + image).
        """
        try:
            messages = []
            
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            
            if image_data:
                # Use multi-modal format for vision tasks
                user_content = [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_data,
                        },
                    },
                ]
            else:
                user_content = prompt

            messages.append({
                "role": "user",
                "content": user_content
            })
            
            # Switch to vision model if image is provided
            model = "meta-llama/llama-4-maverick-17b-128e-instruct" if image_data else self.model
            
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=self.timeout
            )
            
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating response with Groq: {e}")
            raise

    def stream_response(self, prompt, system_prompt=None, temperature=0.7, max_tokens=1024, image_data=None):
        """
        Streams a chat response using Groq API.
        Supports multi-modal input (text + image).
        Yields chunks of text.
        """
        try:
            messages = []
            
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            
            if image_data:
                # Use multi-modal format for vision tasks
                user_content = [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_data,
                        },
                    },
                ]
            else:
                user_content = prompt

            messages.append({
                "role": "user",
                "content": user_content
            })
            
            # Switch to vision model if image is provided
            model = "meta-llama/llama-4-maverick-17b-128e-instruct" if image_data else self.model
            
            stream = self.client.chat.completions.create(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                timeout=self.timeout
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
            
        except Exception as e:
            logger.error(f"Error streaming response with Groq: {e}")
            raise

    def transcribe_audio(self, audio_file):
        """
        Transcribes audio file using Groq's Whisper model.
        
        Args:
            audio_file: File-like object or path to audio file.
            
        Returns:
            str: Transcribed text.
        """
        try:
            transcription = self.client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3",
                response_format="json",
                temperature=0.0
            )
            return transcription.text
        except Exception as e:
            logger.error(f"Error transcribing audio with Groq: {e}")
            raise
