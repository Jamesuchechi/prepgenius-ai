import json

class PromptTemplates:
    @staticmethod
    def get_system_prompt():
        return "You are an expert exam question generator for standardized exams (JAMB, WAEC, NECO, SAT, IELTS, TOEFL, GRE). You must output ONLY valid JSON."

    @staticmethod
    def get_topic_generator_prompt(subject):
        return f"""
        Generate a list of 30-60 or more key study topics for the subject '{subject}', tailored for students preparing for standardized exams (JAMB, WAEC, NECO, SAT, IELTS, TOEFL, GRE).
        The topics should cover the relevant standard curriculum.
        
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
        Ensure the questions are at a {difficulty} level suitable for the relevant exam standards (e.g., JAMB, WAEC, SAT, IELTS, TOEFL, or GRE).
        
        CRITICAL: Mathematical and logical accuracy is paramount. 
        - Double-check all calculations. 
        - Ensure that the options provided are correct and that only one is the correct answer.
        - DO NOT invent arbitrary "scaling factors" or "multipliers" unless they are part of a standard formula.
        - Provide a DETAILED explanation for the correct answer. 
        Where applicable (especially for calculations), include alternative methods or shortcuts to arrive at the answer.
        The explanation should be educational and help the student learn.
        
        CRITICAL: For Reading/Comprehension and Listening subjects, you MUST include the "passage" or "transcript" in the "metadata" field.
        IMPORTANT: This stimulus (passage/transcript) MUST be identical and duplicated for EVERY question in the "questions" list, as each question is stored independently.
        
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
                        "correct_answer_index": 0,
                        "explanation": "Detailed explanation",
                        "metadata": {
                            "passage": "Full comprehension passage (ONLY for Reading/Comprehension)",
                            "transcript": "Full transcript for TTS (ONLY for Listening)"
                        }
                    }
                ]
            }
            """
        elif q_type == "THEORY":
            type_specific_instructions = """
            Output schema:
            {
                "questions": [
                    {
                        "content": "Essay prompt or Speaking cue text",
                        "type": "THEORY",
                        "answer": "Model essay or key points for grading",
                        "explanation": "Grading rubrics",
                        "metadata": {
                            "type": "WRITING|SPEAKING",
                            "writing_task_type": "Task 1|Task 2",
                            "speaking_part": "Part 1|Part 2|Part 3",
                            "passage": "Full comprehension passage if applicable",
                            "transcript": "Full transcript for TTS if applicable",
                            "data_table": "Markdown table or detailed text description representing the data from the graph/chart (MANDATORY for Writing Task 1)"
                        }
                    }
                ]
            }
            
            IMPORTANT: For Writing Task 1, if you mention 'The graph/chart below', you MUST provide the data for that graph/chart in 'metadata.data_table' so the student can actually see the numbers they are describing.
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
                        "metadata": {
                            "passage": "Full comprehension passage if applicable",
                            "transcript": "Full transcript for TTS if applicable"
                        }
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
                        "metadata": {
                            "passage": "Full comprehension passage if applicable",
                            "transcript": "Full transcript for TTS if applicable"
                        }
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
                            ],
                            "passage": "Full comprehension passage if applicable",
                            "transcript": "Full transcript for TTS if applicable"
                        },
                        "explanation": "Why these match"
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
                            "sequence": ["First Event", "Second Event", "Third Event"],
                            "passage": "Full comprehension passage if applicable",
                            "transcript": "Full transcript for TTS if applicable"
                        },
                        "explanation": "Timeline explanation"
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
                        "explanation": "A clear, educative explanation",
                        "metadata": {
                            "passage": "Full comprehension passage if applicable",
                            "transcript": "Full transcript for TTS if applicable"
                        }
                    }
                ]
            }
            """
            
        return f"{base_instruction}\n{type_specific_instructions}\nContext: {context}"
    
    @staticmethod
    def get_chat_tutor_system_prompt(subject=None, exam_type=None):
        """Get the system prompt for the AI chat tutor."""
        subject_text = f" in {subject}" if subject else ""
        exam_text = f" for {exam_type} exams" if exam_type else ""
        
        return f"""You are an expert AI tutor helping students prepare{exam_text}.
You are knowledgeable{subject_text} and other subjects commonly tested in standardized exams (JAMB, WAEC, NECO, GCE, SAT, IELTS, TOEFL, GRE).

Your role is to:
- Address the student by their name occasionally to make it personal.
- act as a supportive mentor and friend, not just a teacher.
- Be empathetic to their stress and emotions.
- engage in casual conversation to build rapport.
- Answer questions clearly and concisely when asked.
- Provide step-by-step explanations when solving problems.
- Encourage critical thinking and understanding.
- Use examples relevant to Nigerian students and in Diaspora.
- Correct misconceptions gently.
- Suggest effective study strategies.

Guidelines:
- **Be Human-like**: Use natural, expressive language. Avoid robotic phrases.
- **Show Empathy**: If the student is stressed or unhappy, comfort them first. Do not force them to study immediately.
- **Context Matters**: If the user wants to chat, chat with them. If they want to study, help them study.
- **Gentle Guidance**: Only redirect to studying when appropriate and after acknowledging the user's current state.
- If you don't know something, admit it honestly.
- Be culturally aware and respectful.
- Be funny and engaging.
- Be motivational and inspiring.
- Be educational and focussed.
- Be Robust and accurate in your responses.

Remember: Your goal is to support the *whole* student—their well-being is as important as their grades."""
    
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
    @staticmethod
    def get_study_plan_prompt(exam_type, subjects, days_available, difficulty_level, daily_hours, weekly_days):
        """Generates a detailed study plan prompt."""
        return f"""
        Create a highly detailed and specific study plan for a student preparing for {exam_type}.
        Subjects: {', '.join(subjects)}
        Total Days Available: {days_available}
        Study Intensity: {daily_hours} hours/day, {weekly_days} days/week
        Target Difficulty: {difficulty_level}
        
        CRITICAL: Do NOT generate generic topics like "General". 
        Break down each subject into its specific actual syllabus topics (e.g., for Biology: "Cell Biology", "Genetics", "Ecology").
        For each topic, provide specific learning objectives.
        
        Output schema:
        {{
            "topic_sequence": [
                {{
                    "subject": "Subject Name",
                    "topic_name": "Specific Topic Name",
                    "estimated_hours": 3.5,
                    "learning_objectives": ["Objective 1", "Objective 2"],
                    "priority": "critical|high|medium|low"
                }}
            ],
            "revision_schedule": [
                {{
                    "topic_name": "Topic to Revise",
                    "reason": "Why prioritize this"
                }}
            ],
            "study_tips": ["Tip 1", "Tip 2"]
        }}
        """
    @staticmethod
    def get_theory_grading_prompt(question_text, user_answer, model_answer, subject, exam_type):
        """Generates a prompt for AI-based theory/essay grading."""
        return f"""
        You are an expert examiner for {exam_type} in the subject {subject}.
        Your task is to grade a student's theory/essay response based on a model answer.
        
        Question: {question_text}
        Model Answer/Guidance: {model_answer}
        Act as an experienced examiner for the {exam_type} {subject} exam.
        Your goal is to provide a FAIR and STRICT evaluation of the student's answer based on the model answer provided.
        
        Question: {question_text}
        Student's Answer: {user_answer}
        Model Answer/Guidance: {model_answer}
        
        Grading Criteria:
        1. Accuracy (0-4 points): Is the information correct?
        2. Completeness (0-4 points): Are all key points addressed?
        3. Clarity & Structure (0-2 points): Is it well-written?
        
        CRITICAL: If the answer is IRRELEVANT to the question or addresses a completely different topic, the total score MUST be 0.
        
        Output only a JSON object with this structure:
        {{
            "score": total_score_out_of_10,
            "feedback": {{
                "critique": "Overall evaluation",
                "accuracy": "Evaluation of accuracy",
                "completeness": "Evaluation of completeness",
                "clarity": "Evaluation of clarity"
            }},
            "improvement_tips": ["Tip 1", "Tip 2", "Tip 3"]
        }}
        """
