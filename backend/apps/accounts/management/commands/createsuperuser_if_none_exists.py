import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser if none exists'

    def handle(self, *args, **options):
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'jamesuchechi27@gmail.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'jamesuchi')

        if not email or not password:
            self.stdout.write(self.style.ERROR('DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD must be set'))
            return

        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.SUCCESS('Superuser already exists. Skipping creation.'))
            return

        try:
            # Custom User model might not have 'username' if it's email-based
            # I'll check the USERNAME_FIELD
            username_field = getattr(User, 'USERNAME_FIELD', 'username')
            
            if username_field == 'email':
                User.objects.create_superuser(
                    email=email,
                    password=password
                )
            else:
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
            self.stdout.write(self.style.SUCCESS(f'Superuser created with email: {email}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating superuser: {e}'))
