import os
import django
# Setup django environment if running standalone
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.base')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
username = 'test_uploader'
password = 'testpassword123'
email = 'uploader@example.com'

if not User.objects.filter(username=username).exists():
    User.objects.create_user(username=username, password=password, email=email)
    print(f"User {username} created.")
else:
    print(f"User {username} already exists.")
