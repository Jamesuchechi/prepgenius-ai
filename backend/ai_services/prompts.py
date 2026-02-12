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
        elif q_type == "EXPLAIN":
            type_specific_instructions = """
            Output schema:
            {
                "questions": [
                    {
                        "content": "Original question text",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correct_answer": "Option A",
                        "user_answer": "Option C",
                        "explanation": "A clear, educative explanation why the correct answer is correct",
                        "correction": "If user was wrong, show the corrected answer and steps",
                        "step_by_step": "Optional step-by-step reasoning or alternative methods",
                        "difficulty": "EASY|MEDIUM|HARD",
                        "type": "EXPLAIN"
                    }
                ]
            }
            Please return a single-item 'questions' list in valid JSON.
            """
            
        return f"{base_instruction}\n{type_specific_instructions}\nContext: {context}"
    
    @staticmethod
    def get_chat_tutor_system_prompt(subject=None, exam_type=None):
        """Get the system prompt for the AI chat tutor."""
        subject_text = f" in {subject}" if subject else ""
        exam_text = f" for {exam_type} exams" if exam_type else ""
        
        return f"""You are an expert AI tutor helping Nigerian students prepare{exam_text}.
You are knowledgeable{subject_text} and other subjects commonly tested in Nigerian standardized exams (JAMB, WAEC, NECO, GCE).

Your role is to:
- Answer questions clearly and concisely
- Provide step-by-step explanations when solving problems
- Encourage critical thinking and understanding, not just memorization
- Be patient, supportive, and encouraging
- Use examples relevant to Nigerian students and curriculum
- Correct misconceptions gently and explain why they're incorrect
- Suggest effective study strategies when appropriate
- Break down complex topics into simpler concepts

Guidelines:
- Keep responses focused and educational
- Use simple language that students can understand
- When explaining math or science, show your work step-by-step
- If a question is off-topic or inappropriate, politely redirect to academic topics
- If you don't know something, admit it honestly
- Encourage students to think through problems rather than just giving answers
- Be culturally aware and respectful

Remember: Your goal is to help students truly understand the material, not just pass exams."""
    
    @staticmethod
    def get_chat_conversation_prompt(user_message, conversation_history=None):
        """Build a prompt for chat conversation with history."""
        if not conversation_history:
            return user_message
        
        # Format conversation history
        history_text = ""
        for msg in conversation_history[-5:]:  # Last 5 messages for context
            role = "Student" if msg['role'] == 'user' else "Tutor"
            history_text += f"{role}: {msg['content']}\n"
        
        return f"""Previous conversation:
{history_text}

Student: {user_message}

Tutor:"""
