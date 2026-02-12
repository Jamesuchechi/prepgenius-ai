"""
Chat service for managing chat sessions and AI interactions.
"""
from typing import List, Dict, Optional
from datetime import timedelta
from django.utils import timezone
from ..models import ChatSession, ChatMessage
from ai_services.router import AIRouter

# Import models for context injection
try:
    from apps.quiz.models import QuizAttempt, AnswerAttempt
    from apps.study_plan.models import StudyPlanItem, StudyProgress
except ImportError:
    # Models might not be available in all environments
    QuizAttempt = None
    AnswerAttempt = None
    StudyPlanItem = None
    StudyProgress = None


class ChatService:
    """Service class for chat operations."""
    
    def __init__(self):
        self.ai_router = AIRouter()
    
    def create_session(self, user, subject=None, exam_type=None, title=None, 
                      tone='casual', detail_level='detailed', 
                      use_analogies=True, socratic_mode=False) -> ChatSession:
        """Create a new chat session."""
        session = ChatSession.objects.create(
            user=user,
            subject=subject,
            exam_type=exam_type,
            title=title or f"Chat - {timezone.now().strftime('%Y-%m-%d %H:%M')}",
            tone=tone,
            detail_level=detail_level,
            use_analogies=use_analogies,
            socratic_mode=socratic_mode
        )
        return session
    
    def get_or_create_active_session(self, user, subject=None, exam_type=None) -> ChatSession:
        """Get the user's active session or create a new one."""
        # Try to get an active session
        active_session = ChatSession.objects.filter(
            user=user,
            is_active=True
        ).first()
        
        if active_session:
            return active_session
        
        # Create a new session if none exists
        return self.create_session(user, subject, exam_type)
    
    def get_session(self, session_id, user) -> Optional[ChatSession]:
        """Get a specific session for a user."""
        try:
            return ChatSession.objects.get(id=session_id, user=user)
        except ChatSession.DoesNotExist:
            return None
    
    def save_message(self, session: ChatSession, role: str, content: str, metadata: Dict = None) -> ChatMessage:
        """Save a message to the database."""
        message = ChatMessage.objects.create(
            session=session,
            role=role,
            content=content,
            metadata=metadata or {}
        )
        
        # Update session's updated_at timestamp
        session.updated_at = timezone.now()
        session.save(update_fields=['updated_at'])
        
        return message
    
    def get_conversation_history(self, session: ChatSession, limit: int = 10) -> List[Dict]:
        """
        Get recent conversation history for context.
        Returns a list of message dicts suitable for AI context.
        """
        messages = session.messages.order_by('-timestamp')[:limit]
        
        # Reverse to get chronological order
        messages = reversed(messages)
        
        return [
            {
                'role': msg.role,
                'content': msg.content
            }
            for msg in messages
        ]
    
    def generate_ai_response(
        self,
        session: ChatSession,
        user_message: str,
        context: Dict = None
    ) -> str:
        """
        Generate an AI response based on the user message and conversation history.
        """
        # Get conversation history
        history = self.get_conversation_history(session, limit=10)
        
        # Build context for AI
        # Use session data or user profile as fallback
        subject = context.get('subject') or session.subject or 'General Studies'
        
        # Get exam type from session or user profile
        exam_type = context.get('exam_type') or session.exam_type
        if not exam_type and session.user.exam_targets:
            # If user has exam targets, use them formatted nicely, otherwise generic
            exam_type = ", ".join(session.user.exam_targets) if isinstance(session.user.exam_targets, list) else str(session.user.exam_targets)
        
        if not exam_type:
            exam_type = "school exams"
        
        # Create system prompt with enhanced user context
        user_name = session.user.first_name or "Student"
        enhanced_context = self._build_enhanced_context(session)
        system_prompt = self._build_system_prompt_with_context(subject, exam_type, enhanced_context, session)
        
        # Build conversation context
        conversation_context = self._build_conversation_context(history, user_message)
        
        # Generate response using AI router
        try:
            response = self.ai_router.generate_chat_response(
                message=user_message,
                conversation_history=history,
                system_prompt=system_prompt,
                context=context or {}
            )
            return response
        except Exception as e:
            # Fallback response if AI fails
            return f"I apologize, {user_name}, but I'm having trouble generating a response right now. Please try again. Error: {str(e)}"
    
    def stream_ai_response(
        self,
        session: ChatSession,
        user_message: str,
        context: Dict = None
    ):
        """
        Stream an AI response based on the user message and conversation history.
        Yields chunks of text.
        """
        # Get conversation history
        history = self.get_conversation_history(session, limit=10)
        
        # Build context for AI
        subject = context.get('subject') or session.subject or 'General Studies'
        exam_type = context.get('exam_type') or session.exam_type
        
        if not exam_type and session.user.exam_targets:
            exam_type = ", ".join(session.user.exam_targets) if isinstance(session.user.exam_targets, list) else str(session.user.exam_targets)
        
        if not exam_type:
            exam_type = "school exams"
        
        # Create system prompt with enhanced user context
        enhanced_context = self._build_enhanced_context(session)
        system_prompt = self._build_system_prompt_with_context(subject, exam_type, enhanced_context, session)
        
        # Generate response using AI router
        try:
            for chunk in self.ai_router.stream_chat_response(
                message=user_message,
                conversation_history=history,
                system_prompt=system_prompt,
                context=context or {}
            ):
                yield chunk
        except Exception as e:
            # Fallback response if AI fails
            error_msg = f"Error streaming response: {str(e)}"
            yield error_msg
    
    def _build_system_prompt(self, subject: str, exam_type: str, user_name: str) -> str:
        """Build the system prompt for the AI tutor."""
        return f"""You are an expert AI tutor named PrepGenius helping {user_name} prepare for {exam_type}.
You are knowledgeable in {subject} and other subjects commonly tested in Nigerian standardized exams.

Your role is to:
- Address the student by their name, {user_name}, occasionally to make it personal.
- Answer questions clearly and concisely.
- Provide step-by-step explanations when needed.
- Encourage critical thinking.
- Be patient, supportive, and motivating.
- Use examples relevant to Nigerian students.
- Correct misconceptions gently.
- Suggest study strategies when appropriate.
Keep responses focused and educational. If a question is off-topic or inappropriate, politely redirect to academic topics."""
    
    def _build_system_prompt_with_context(self, subject: str, exam_type: str, context: Dict, session: ChatSession = None) -> str:
        """Build the system prompt with enhanced user context."""
        user_name = context.get('user_name', 'Student')
        weak_topics = context.get('weak_topics', [])
        recent_topics = context.get('recent_topics', [])
        upcoming_tasks = context.get('upcoming_tasks', [])
        
        # Build base prompt
        base_prompt = f"""You are an expert AI tutor named PrepGenius helping {user_name} prepare for {exam_type}.
You are knowledgeable in {subject} and other subjects commonly tested in Nigerian standardized exams.

"""
        
        # Add personalized context if available
        if weak_topics or recent_topics or upcoming_tasks:
            base_prompt += "STUDENT CONTEXT:\n"
            
            if weak_topics:
                weak_list = ", ".join(weak_topics)
                base_prompt += f"- Weak areas (needs extra practice): {weak_list}\n"
            
            if recent_topics:
                recent_list = ", ".join(recent_topics)
                base_prompt += f"- Recently studied topics: {recent_list}\n"
            
            if upcoming_tasks:
                tasks_list = ", ".join(upcoming_tasks[:3])
                base_prompt += f"- Upcoming study tasks: {tasks_list}\n"
            
            base_prompt += "\n"
        
        # Add instructions
        base_prompt += f"""Your role is to:
- Address the student by their name, {user_name}, occasionally to make it personal.
- Answer questions clearly and concisely.
- Provide step-by-step explanations when needed.
- Encourage critical thinking."""
        
        # Add context-aware instructions
        if weak_topics:
            base_prompt += "\n- When relevant, gently reference their weak areas and offer extra practice suggestions."
        
        if recent_topics:
            base_prompt += "\n- Build on topics they recently studied to reinforce learning."
        
        if upcoming_tasks:
            base_prompt += "\n- Occasionally guide them toward their upcoming study tasks."
        
        base_prompt += """
- Be patient, supportive, and motivating.
- Use examples relevant to Nigerian students.
- Correct misconceptions gently.
- Suggest study strategies when appropriate."""

        # Add style-specific instructions
        if session:
            if session.tone == 'formal':
                base_prompt += "\n- Use formal, academic language and professional tone."
            else:
                base_prompt += "\n- Use friendly, conversational language that feels approachable."
            
            if session.detail_level == 'concise':
                base_prompt += "\n- Keep explanations brief and to the point. Avoid unnecessary details."
            else:
                base_prompt += "\n- Provide detailed, thorough explanations with examples."
            
            if session.use_analogies:
                base_prompt += "\n- Use analogies, metaphors, and real-world examples to illustrate concepts."
            
            if session.socratic_mode:
                base_prompt += "\n- Use the Socratic method: ask guiding questions to help the student discover answers themselves."
        
        base_prompt += """

Keep responses focused and educational. If a question is off-topic or inappropriate, politely redirect to academic topics."""
        
        return base_prompt

    
    def _build_enhanced_context(self, session: ChatSession) -> Dict:
        """Build enhanced context from user's study data."""
        user = session.user
        
        context = {
            'user_name': user.first_name or 'Student',
            'exam_targets': self._get_exam_targets(user),
            'weak_topics': self._get_weak_topics(user),
            'recent_topics': self._get_recent_study_topics(user),
            'upcoming_tasks': self._get_upcoming_tasks(user),
        }
        
        return context
    
    def _get_exam_targets(self, user) -> List[str]:
        """Get user's target exams."""
        try:
            targets = user.exam_targets.all()
            return [str(target.exam) for target in targets] if targets.exists() else []
        except:
            return []
    
    def _get_weak_topics(self, user, threshold=0.60) -> List[str]:
        """Get topics where user performs below threshold accuracy."""
        try:
            # Get all answer attempts for this user
            attempts = AnswerAttempt.objects.filter(
                quiz_attempt__user=user,
                quiz_attempt__completed_at__isnull=False
            ).select_related('question')
            
            if not attempts.exists():
                return []
            
            # Group by topic and calculate accuracy
            topic_stats = {}
            for attempt in attempts:
                topic = attempt.question.topic
                if topic not in topic_stats:
                    topic_stats[topic] = {'correct': 0, 'total': 0}
                
                topic_stats[topic]['total'] += 1
                if attempt.is_correct:
                    topic_stats[topic]['correct'] += 1
            
            # Find weak topics (below threshold)
            weak_topics = []
            for topic, stats in topic_stats.items():
                accuracy = stats['correct'] / stats['total'] if stats['total'] > 0 else 0
                if accuracy < threshold and stats['total'] >= 3:  # At least 3 attempts
                    weak_topics.append(str(topic))
            
            return weak_topics[:5]  # Limit to top 5 weak topics
        except Exception as e:
            print(f"Error getting weak topics: {e}")
            return []
    
    def _get_recent_study_topics(self, user, days=7) -> List[str]:
        """Get topics studied in the last N days."""
        try:
            cutoff_date = timezone.now() - timedelta(days=days)
            
            # Get recent quiz attempts
            recent_attempts = QuizAttempt.objects.filter(
                user=user,
                started_at__gte=cutoff_date
            ).select_related('quiz').order_by('-started_at')
            
            topics = set()
            for attempt in recent_attempts[:10]:  # Last 10 attempts
                if attempt.quiz.topic:
                    topics.add(str(attempt.quiz.topic))
            
            return list(topics)[:5]  # Limit to 5 topics
        except Exception as e:
            print(f"Error getting recent topics: {e}")
            return []
    
    def _get_upcoming_tasks(self, user, limit=3) -> List[str]:
        """Get upcoming study plan tasks."""
        try:
            # Get incomplete study plan items
            upcoming = StudyPlanItem.objects.filter(
                study_plan__user=user,
                completed=False
            ).order_by('order')[:limit]
            
            tasks = []
            for item in upcoming:
                if item.topic:
                    tasks.append(f"{item.topic.name}")
                elif item.description:
                    tasks.append(item.description[:50])  # First 50 chars
            
            return tasks
        except Exception as e:
            print(f"Error getting upcoming tasks: {e}")
            return []
    
    def _build_conversation_context(self, history: List[Dict], current_message: str) -> str:
        """Build a text representation of the conversation for context."""
        context_parts = []
        
        for msg in history[-5:]:  # Last 5 messages for context
            role = "Student" if msg['role'] == 'user' else "Tutor"
            context_parts.append(f"{role}: {msg['content']}")
        
        context_parts.append(f"Student: {current_message}")
        
        return "\n".join(context_parts)
    
    def get_suggested_questions(self, user, subject: str = None) -> List[str]:
        """Generate suggested questions based on user's context."""
        # This could be enhanced with AI or based on user's weak areas
        default_questions = [
            "Can you explain this topic to me?",
            "What are the key points I should remember?",
            "Can you give me practice questions on this?",
            "How should I approach this type of problem?",
            "What are common mistakes students make here?",
        ]
        
        if subject:
            subject_questions = {
                'Mathematics': [
                    "How do I solve quadratic equations?",
                    "Can you explain differentiation?",
                    "What's the best way to approach word problems?",
                ],
                'English': [
                    "How can I improve my essay writing?",
                    "What are the parts of speech?",
                    "Can you explain comprehension strategies?",
                ],
                'Physics': [
                    "Can you explain Newton's laws?",
                    "How do I solve motion problems?",
                    "What's the difference between speed and velocity?",
                ],
                'Chemistry': [
                    "Can you explain the periodic table?",
                    "How do I balance chemical equations?",
                    "What are oxidation and reduction?",
                ],
                'Biology': [
                    "Can you explain cell structure?",
                    "What is photosynthesis?",
                    "How does the circulatory system work?",
                ],
            }
            return subject_questions.get(subject, default_questions)
        
        return default_questions
    
    def delete_session(self, session_id, user) -> bool:
        """Soft delete a session (mark as inactive)."""
        try:
            session = ChatSession.objects.get(id=session_id, user=user)
            session.is_active = False
            session.save()
            return True
        except ChatSession.DoesNotExist:
            return False
