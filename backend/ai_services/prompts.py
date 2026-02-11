import json

class PromptTemplates:
    @staticmethod
    def get_system_prompt():
        return "You are an expert exam question generator for Nigerian students (JAMB, WAEC, NECO). You must output ONLY valid JSON."

    @staticmethod
    def get_topic_generator_prompt(subject):
        return f"""
        Generate a list of 15-30 or more key study topics for the subject '{subject}', tailored for Nigerian students preparing for JAMB, WAEC, and NECO exams.
        The topics should cover the standard curriculum.
        
        Output schema:
        {{
            "topics": [
                {{
                    "name": "Topic Name",
                    "description": "Brief description of the topic",
                    "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
                    "estimated_hours": 2.5
                }}
            ]
        }}
        """

    @staticmethod
    def get_question_prompt(topic, difficulty, count, q_type, context=""):
        base_instruction = f"""
        Generate {count} {difficulty} questions on the topic '{topic}' for {q_type} format.
        Ensure the questions are at a {difficulty} level suitable for JAMB/WAEC students.
        
        CRITICAL: Provide a DETAILED explanation for the correct answer. 
        Where applicable (especially for calculations), include alternative methods or shortcuts to arrive at the answer.
        The explanation should be educational and help the student learn.
        
        Strictly follow the JSON schema below for the output.
        """
        
        type_specific_instructions = ""
        
        if q_type == "MCQ":
            type_specific_instructions = """
            Output schema:
            {
                "questions": [
                    {
                        "content": "Question text here",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct_answer": "Option A",  # Must match one of the options exactly
                        "explanation": "Brief explanation of why the answer is correct",
                        "difficulty": "EASY|MEDIUM|HARD",
                        "type": "MCQ"
                    }
                ]
            }
            Ensure keys are exactly as shown. 'options' must be a list of 4 strings.
            """
        elif q_type == "THEORY":
            type_specific_instructions = """
            Output schema:
            {
                "questions": [
                    {
                        "content": "Question text here",
                        "answer": "Expected key points or full answer",
                        "explanation": " detailed explanation",
                        "difficulty": "EASY|MEDIUM|HARD",
                        "type": "THEORY"
                    }
                ]
            }
            """
        elif q_type == "TRUE_FALSE":
            type_specific_instructions = """
            Output schema:
            {
                "questions": [
                    {
                        "content": "Statement text here",
                        "correct_answer": "True", # or "False"
                        "explanation": "Reasoning",
                        "difficulty": "EASY|MEDIUM|HARD",
                        "type": "TRUE_FALSE"
                    }
                ]
            }
            """
        elif q_type == "FILL_BLANK":
            type_specific_instructions = """
            Output schema:
            {
                "questions": [
                    {
                        "content": "The capital of Nigeria is _______.",
                        "correct_answer": "Abuja",
                        "explanation": "Context about Abuja",
                        "difficulty": "EASY|MEDIUM|HARD",
                        "type": "FILL_BLANK"
                    }
                ]
            }
            """
        elif q_type == "MATCHING":
            type_specific_instructions = """
            Output schema:
            {
                "questions": [
                    {
                        "content": "Match the following items",
                        "metadata": {
                            "pairs": [
                                {"item": "Item 1", "match": "Match 1"},
                                {"item": "Item 2", "match": "Match 2"}
                            ]
                        },
                        "explanation": "Why these match",
                        "difficulty": "EASY|MEDIUM|HARD",
                        "type": "MATCHING"
                    }
                ]
            }
            """
        elif q_type == "ORDERING":
            type_specific_instructions = """
            Output schema:
            {
                "questions": [
                    {
                        "content": "Order the following events chronologically",
                        "metadata": {
                            "sequence": ["First Event", "Second Event", "Third Event"]
                        },
                        "explanation": "Timeline explanation",
                        "difficulty": "EASY|MEDIUM|HARD",
                        "type": "ORDERING"
                    }
                ]
            }
            """
            
        return f"{base_instruction}\n{type_specific_instructions}\nContext: {context}"
