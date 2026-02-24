from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_verification_email_task(user_email, user_name, token):
    """
    Task to send verification email.
    Called via async_task from views.
    """
    logger.info(f"Preparing to send verification email to {user_email}")
    logger.debug(f"Email Settings: HOST={settings.EMAIL_HOST}, PORT={settings.EMAIL_PORT}, TLS={settings.EMAIL_USE_TLS}, SSL={settings.EMAIL_USE_SSL}, TIMEOUT={settings.EMAIL_TIMEOUT}")
    
    try:
        context = {
            'user_name': user_name,
            'verification_code': token,
            'expires_in_hours': 24
        }
        
        html_message = render_to_string('email/verify_email.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Verify your PrepGenius account',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
        )
        logger.info(f"Verification email sent successfully to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email to {user_email}: {str(e)}")
        return False

def send_password_reset_email_task(user_email, user_name, reset_url):
    """
    Task to send password reset email.
    """
    try:
        context = {
            'user_name': user_name,
            'reset_url': reset_url,
            'expires_in_hours': 1
        }
        
        html_message = render_to_string('email/reset_password.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Reset your PrepGenius password',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
        )
        logger.info(f"Password reset email sent successfully to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user_email}: {str(e)}")
        return False
