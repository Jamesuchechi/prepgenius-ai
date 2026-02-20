from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

class ContactView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        first_name = data.get('firstName', '')
        last_name = data.get('lastName', '')
        email = data.get('email', '')
        subject = data.get('subject', 'General Inquiry')
        message = data.get('message', '')

        if not email or not message:
            return Response({'error': 'Email and message are required.'}, status=400)

        # Send email to admin
        admin_subject = f"New Contact Request: {subject} from {first_name} {last_name}"
        
        context = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'subject': subject,
            'message': message,
        }
        
        admin_html_content = render_to_string('emails/contact_admin.html', context)
        admin_text_content = strip_tags(admin_html_content)
        
        # Try to specify admin email for recipient, or fallback to default from email.
        # Ensure we do not send to empty email list
        recipient = settings.DEFAULT_FROM_EMAIL
        
        try:
            msg_admin = EmailMultiAlternatives(
                subject=admin_subject,
                body=admin_text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient],
            )
            msg_admin.attach_alternative(admin_html_content, "text/html")
            msg_admin.send(fail_silently=False)

            # Send automated reply to user
            user_subject = f"Re: {subject} - We have received your message!"
            
            user_html_content = render_to_string('emails/contact_user.html', context)
            user_text_content = strip_tags(user_html_content)

            msg_user = EmailMultiAlternatives(
                subject=user_subject,
                body=user_text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )
            msg_user.attach_alternative(user_html_content, "text/html")
            msg_user.send(fail_silently=False)

            return Response({'success': True, 'message': 'Message sent successfully.'})
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=500)
