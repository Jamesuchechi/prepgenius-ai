import os
from celery import Celery
from celery.schedules import crontab
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')

app = Celery('core')

# Load configuration from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered Django apps
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    # Example periodic task
    # 'send-reports': {
    #     'task': 'apps.tasks.send_reports',
    #     'schedule': crontab(hour=0, minute=0),  # Daily at midnight
    # },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')