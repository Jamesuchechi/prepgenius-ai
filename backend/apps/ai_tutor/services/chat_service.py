"""
Chat service for managing chat sessions and AI interactions.
"""
from typing import List, Dict, Optional
from django.utils import timezone
from ..models import ChatSession, ChatMessage
from ai_services.router import AIRouter


class ChatService:
    """Service class for chat operations."""
    
    def __init__(self):
        self.ai_router = AIRouter()
    
    def create_session(self, user, subject=None, exam_type=None, title=None) -> ChatSession:
        """Create a new chat session."""
        session = ChatSession.objects.create(
            user=user,
            subject=subject,
            exam_type=exam_type,
            title=title or f"Chat - {timezone.now().strftime('%Y-%m-%d %H:%M')}"
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
        
        # Create system prompt with user context
        user_name = session.user.first_name or "Student"
        system_prompt = self._build_system_prompt(subject, exam_type, user_name)
        
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
