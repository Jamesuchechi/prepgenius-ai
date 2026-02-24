import resend
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
from django.core.mail.message import EmailMultiAlternatives
import logging

logger = logging.getLogger(__name__)

class ResendEmailBackend(BaseEmailBackend):
    """
    A Django email backend that sends messages via Resend.
    """
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = getattr(settings, "RESEND_API_KEY", None)
        if not self.api_key:
            logger.warning("RESEND_API_KEY is not set in settings.")
        resend.api_key = self.api_key

    def send_messages(self, email_messages):
        """
        Sends one or more EmailMessage objects and returns the number of email
        messages sent.
        """
        if not email_messages:
            return 0
        
        num_sent = 0
        for message in email_messages:
            if self._send(message):
                num_sent += 1
        return num_sent

    def _send(self, email_message):
        """
        A helper method that does the actual sending.
        """
        if not email_message.recipients():
            return False
        
        try:
            params = {
                "from": email_message.from_email or settings.DEFAULT_FROM_EMAIL,
                "to": email_message.to,
                "subject": email_message.subject,
                "html": "",
                "text": email_message.body,
            }

            # Handle HTML content
            if isinstance(email_message, EmailMultiAlternatives):
                for content, mimetype in email_message.alternatives:
                    if mimetype == "text/html":
                        params["html"] = content
                        break
            
            # If no HTML content was found in alternatives, check if the main body is HTML
            if not params["html"] and getattr(email_message, 'content_subtype', None) == 'html':
                params["html"] = email_message.body

            # Attachments
            if email_message.attachments:
                attachments = []
                for attachment in email_message.attachments:
                    # attachment can be (filename, content, mimetype) or MIMEBase object
                    if isinstance(attachment, tuple):
                        # filename, content, mimetype = attachment
                        # Handle potential 4th element (headers)
                        filename = attachment[0]
                        content = attachment[1]
                        mimetype = attachment[2]
                        
                        attachments.append({
                            "filename": filename,
                            "content": list(content) if isinstance(content, bytes) else content,
                        })
                if attachments:
                    params["attachments"] = attachments

            resend.Emails.send(params)
            return True
        except Exception as e:
            if not self.fail_silently:
                raise
            logger.error(f"Error sending email via Resend: {e}")
            return False
