import pytest
from ai_services.prompts import PromptTemplates

def test_mcq_prompt_contains_specialized_metadata():
    """Verify that MCQ prompts include metadata for Reading and Listening."""
    prompt = PromptTemplates.get_question_prompt(
        topic="IELTS Reading",
        difficulty="MEDIUM",
        count=5,
        q_type="MCQ",
        context="This is a READING module."
    )
    
    # Check if schema instructions mention passage and transcript
    assert '"passage": "Full comprehension passage' in prompt
    assert '"transcript": "Full transcript for TTS' in prompt
    assert "READING" in prompt

def test_theory_prompt_contains_essay_metadata():
    """Verify that THEORY prompts include metadata for Writing and Speaking."""
    prompt = PromptTemplates.get_question_prompt(
        topic="IELTS Writing",
        difficulty="HARD",
        count=1,
        q_type="THEORY",
        context="This is a WRITING module."
    )
    
    # Check if schema instructions mention writing_task_type and speaking_part
    assert '"writing_task_type": "Task 1|Task 2"' in prompt
    assert '"speaking_part": "Part 1|Part 2|Part 3"' in prompt
    assert '"transcript": "Full transcript for TTS' in prompt
    assert "WRITING" in prompt

def test_prompt_difficulty_injection():
    """Verify difficulty is correctly injected into the prompt."""
    prompt = PromptTemplates.get_question_prompt(
        topic="Biology",
        difficulty="HARD",
        count=3,
        q_type="MCQ"
    )
    assert "Generate 3 HARD questions" in prompt
