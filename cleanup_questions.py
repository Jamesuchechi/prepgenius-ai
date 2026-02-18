import os
import django
import sys

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.questions.models import Question

def cleanup():
    count = 0
    for q in Question.objects.all():
        if q.question_type == 'MCQ' and q.answers.filter(is_correct=True).count() == 0:
            print(f"Deleting broken question {q.id}: {q.content[:50]}")
            q.delete()
            count += 1
    print(f"Successfully deleted {count} broken questions.")

if __name__ == "__main__":
    cleanup()
