"""
WebSocket consumer for real-time chat with AI tutor.
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for AI tutor chat."""
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.user = None
        self.session = None
        
        # Authenticate user
        try:
            self.user = await self.get_user_from_token()
            if not self.user:
                await self.close(code=4001)
                return
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            await self.close(code=4001)
            return
        
        # Verify session belongs to user
        try:
            self.session = await self.get_session()
            if not self.session:
                await self.close(code=4004)
                return
        except Exception as e:
            logger.error(f"Session error: {e}")
            await self.close(code=4004)
            return
        
        # Accept connection
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection',
            'status': 'connected',
            'session_id': str(self.session_id)
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        logger.info(f"WebSocket disconnected: {close_code}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            else:
                await self.send_error(f"Unknown message type: {message_type}")
        
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            await self.send_error("An error occurred processing your message")
    
    async def handle_chat_message(self, data):
        """Handle a chat message from the user."""
        # Lazy imports to avoid AppRegistryNotReady
        from .services import ChatService, RateLimiter, ModerationService
        
        message = data.get('message', '').strip()
        context = data.get('context', {})
        
        if not message:
            await self.send_error("Message cannot be empty")
            return
        
        # Moderate message
        is_allowed, reason = await database_sync_to_async(
            ModerationService.moderate_message
        )(message)
        
        if not is_allowed:
            await self.send_error(f"Message not allowed: {reason}")
            return
        
        # Check rate limit
        is_allowed, remaining = await database_sync_to_async(
            RateLimiter.check_rate_limit
        )(self.user)
        
        if not is_allowed:
            reset_time = await database_sync_to_async(
                RateLimiter.get_reset_time
            )(self.user)
            await self.send_error(
                f"Rate limit exceeded. Try again after {reset_time.strftime('%H:%M')}"
            )
            return
        
        # Increment rate limit counter
        await database_sync_to_async(
            RateLimiter.increment_count
        )(self.user)
        
        # Save user message
        user_message = await self.save_message('user', message)
        
        # Send user message confirmation
        await self.send(text_data=json.dumps({
            'type': 'message_saved',
            'message_id': str(user_message.id),
            'timestamp': user_message.timestamp.isoformat()
        }))
        
        # Send typing indicator
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'is_typing': True
        }))
        
        # Generate AI response
        try:
            chat_service = ChatService()
            ai_response = await database_sync_to_async(
                chat_service.generate_ai_response
            )(self.session, message, context)
            
            # Save AI response
            ai_message = await self.save_message('assistant', ai_response)
            
            # Send AI response
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'role': 'assistant',
                'message': ai_response,
                'message_id': str(ai_message.id),
                'timestamp': ai_message.timestamp.isoformat()
            }))
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            await self.send_error("Sorry, I'm having trouble generating a response. Please try again.")
        
        finally:
            # Stop typing indicator
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'is_typing': False
            }))
    
    async def send_error(self, message):
        """Send an error message to the client."""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))
    
    @database_sync_to_async
    def get_user_from_token(self):
        """Extract and validate user from JWT token."""
        # Lazy imports to avoid AppRegistryNotReady
        from django.contrib.auth import get_user_model
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import TokenError
        
        User = get_user_model()
        
        # Get token from query string
        query_string = self.scope.get('query_string', b'').decode()
        token_param = None
        
        for param in query_string.split('&'):
            if param.startswith('token='):
                token_param = param.split('=')[1]
                break
        
        if not token_param:
            logger.error("No token provided in query string")
            return None
        
        try:
            # Validate token
            access_token = AccessToken(token_param)
            user_id = access_token['user_id']
            
            # Get user
            user = User.objects.get(id=user_id)
            return user
        except TokenError as e:
            logger.error(f"Invalid token: {e}")
            return None
        except User.DoesNotExist:
            logger.error(f"User not found for token")
            return None
        except Exception as e:
            logger.error(f"Error validating token: {e}")
            return None
    
    @database_sync_to_async
    def get_session(self):
        """Get the chat session."""
        from .models import ChatSession
        try:
            session = ChatSession.objects.get(
                id=self.session_id,
                user=self.user,
                is_active=True
            )
            return session
        except ChatSession.DoesNotExist:
            logger.error(f"Session {self.session_id} not found for user {self.user.id}")
            return None
    
    @database_sync_to_async
    def save_message(self, role, content):
        """Save a message to the database."""
        from .models import ChatMessage
        
        message = ChatMessage.objects.create(
            session=self.session,
            role=role,
            content=content
        )
        
        # Update session timestamp
        self.session.save(update_fields=['updated_at'])
        
        return message
