import json
import re
from typing import List, Dict, Optional
from ai_services.router import AIModelRouter
from ..models import Question, Answer
from apps.content.models import Subject, Topic, ExamType

class QuestionGenerationService:
    def __init__(self):
        self.ai_router = AIModelRouter()

    def generate_questions(self, subject_id: int, topic_id: int, exam_type_id: int, 
                          difficulty: str = "MEDIUM", count: int = 5) -> List[Question]:
        
        subject = Subject.objects.get(id=subject_id)
        topic = Topic.objects.get(id=topic_id)
        exam_type = ExamType.objects.get(id=exam_type_id)
        
        system_prompt = (
            "You are an expert exam question generator for African students "
            f"preparing for {exam_type.name}. "
            "Output strictly in JSON format. IMPORTANT: If you use any mathematical symbols "
            "or LaTeX, you MUST double-escape all backslashes (e.g., use \\\\frac instead of \\frac) "
            "to ensure the JSON is valid."
        )
        
        prompt = (
            f"Generate {count} {difficulty} difficulty multiple-choice questions "
            f"on the subject '{subject.name}', topic '{topic.name}'.\n\n"
            "Format the output as a JSON list of objects with the following structure:\n"
            "[\n"
            "  {\n"
            "    \"content\": \"Question text here\",\n"
            "    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
            "    \"correct_option_index\": 0,\n"
            "    \"explanation\": \"Detailed explanation of why the correct answer is right\"\n"
            "  }\n"
            "]\n"
            "Ensure the questions are high-quality, relevant to the syllabus, and unambiguous. "
            "Do not include any text before or after the JSON array."
        )
        
        response_text = self.ai_router.generate_response(prompt, system_prompt)
        print(f"DEBUG: Raw AI Response: {response_text}")
        # Clean response (sometimes LMs add markdown code blocks)
        cleaned_response = self._clean_json_response(response_text)
        print(f"DEBUG: Cleaned Response: {cleaned_response}")
        
        try:
            questions_data = json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            print(f"DEBUG: Initial JSON parse failed: {e}")
            # Fallback: Try to fix common JSON escaping issues (like unescaped backslashes in LaTeX)
            try:
                # Replace single backslashes (not part of an existing escape) with double backslashes
                # This is a bit naive but handles the most common case of \frac, \sqrt etc.
                fixed_json = re.sub(r'(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'\\\\', cleaned_response)
                print(f"DEBUG: Attempting parse with fixed JSON: {fixed_json}")
                questions_data = json.loads(fixed_json)
                print("DEBUG: Fixed JSON parse successful!")
            except Exception as e2:
                print(f"DEBUG: Fixed JSON parse also failed: {e2}")
                raise Exception(f"Failed to parse AI response as JSON: {e}\nResponse prefix: {cleaned_response[:100]}")

        created_questions = []
        for q_data in questions_data:
            question = Question.objects.create(
                subject=subject,
                topic=topic,
                exam_type=exam_type,
                content=q_data['content'],
                question_type='MCQ',
                difficulty=difficulty
            )
            
            for index, option_text in enumerate(q_data['options']):
                is_correct = (index == q_data['correct_option_index'])
                Answer.objects.create(
                    question=question,
                    content=option_text,
                    is_correct=is_correct,
                    explanation=q_data['explanation'] if is_correct else ""
                )
            
            created_questions.append(question)
            
        return created_questions

    def _clean_json_response(self, text: str) -> str:
        """Extracts JSON content from the AI response string."""
        text = text.strip()
        
        # Remove markdown code blocks if present
        if text.startswith("```"):
            # Matches ```json or just ```
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
        
        # If there's still extra text, find the first '[' and last ']'
        if not (text.startswith('[') and text.endswith(']')):
            start = text.find('[')
            end = text.rfind(']')
            if start != -1 and end != -1:
                text = text[start:end+1]
        
        return text.strip()
