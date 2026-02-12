"""
Content moderation service for chat messages.
"""
import re
from typing import Tuple


class ModerationService:
    """Service for moderating chat content."""
    
    # Basic profanity list (expand as needed)
    PROFANITY_LIST = [
        'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'bastard',
        # Add more as needed, but keep it reasonable
    ]
    
    # Spam patterns
    SPAM_PATTERNS = [
        r'(.)\1{10,}',  # Repeated characters
        r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',  # URLs
        r'\b\d{10,}\b',  # Long numbers (phone numbers, etc.)
    ]
    
    MAX_MESSAGE_LENGTH = 2000
    MIN_MESSAGE_LENGTH = 1
    
    @staticmethod
    def moderate_message(content: str) -> Tuple[bool, str]:
        """
        Moderate a message for inappropriate content.
        Returns (is_allowed, reason)
        """
        # Check message length
        if len(content) < ModerationService.MIN_MESSAGE_LENGTH:
            return False, "Message is too short"
        
        if len(content) > ModerationService.MAX_MESSAGE_LENGTH:
            return False, f"Message exceeds maximum length of {ModerationService.MAX_MESSAGE_LENGTH} characters"
        
        # Check for profanity (basic check)
        if ModerationService._contains_profanity(content):
            return False, "Message contains inappropriate language"
        
        # Check for spam patterns
        if ModerationService._is_spam(content):
            return False, "Message appears to be spam"
        
        # Check if message is empty or just whitespace
        if not content.strip():
            return False, "Message cannot be empty"
        
        return True, ""
    
    @staticmethod
    def _contains_profanity(content: str) -> bool:
        """Check if content contains profanity."""
        content_lower = content.lower()
        
        for word in ModerationService.PROFANITY_LIST:
            # Use word boundaries to avoid false positives
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, content_lower):
                return True
        
        return False
    
    @staticmethod
    def _is_spam(content: str) -> bool:
        """Check if content matches spam patterns."""
        for pattern in ModerationService.SPAM_PATTERNS:
            if re.search(pattern, content):
                return True
        
        return False
    
    @staticmethod
    def sanitize_message(content: str) -> str:
        """Sanitize message content (trim whitespace, etc.)."""
        return content.strip()
