
from django.core.management.base import BaseCommand
from apps.study_plans.models import StudyTask
from apps.questions.models import Question

class Command(BaseCommand):
    help = 'Backfill StudyTask.questions from question_ids JSON field'

    def handle(self, *args, **options):
        # Find tasks that have question_ids but no M2M questions linked (or just update all)
        tasks = StudyTask.objects.exclude(question_ids=[])
        total_updated = 0
        
        self.stdout.write(f"Found {tasks.count()} tasks with question_ids")
        
        for task in tasks:
            try:
                question_ids = task.question_ids
                if not question_ids:
                    continue
                
                # Filter valid questions
                valid_questions = Question.objects.filter(id__in=question_ids)
                
                if valid_questions.exists():
                    task.questions.set(valid_questions)
                    total_updated += 1
                    # self.stdout.write(f"Updated task {task.id} with {valid_questions.count()} questions")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error updating task {task.id}: {e}"))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully backfilled {total_updated} tasks'))
