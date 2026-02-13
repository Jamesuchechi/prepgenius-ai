import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from django.contrib.auth import get_user_model

def create_test_user():
    User = get_model = get_user_model()
    try:
        user, created = User.objects.get_or_create(
            email='test@example.com',
            username='testuser'
        )
        if created:
            user.set_password('password123')
            user.first_name = 'Test'
            user.last_name = 'User'
            user.save()
            print("User created: test@example.com / password123")
        else:
            print("User already exists: test@example.com / password123")
            
    except Exception as e:
        print(f"Error creating user: {e}")

if __name__ == "__main__":
    create_test_user()
