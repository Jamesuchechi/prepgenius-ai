from django.core.management.base import BaseCommand
from apps.content.models import Subject, ExamType, ExamTypeSubject

class Command(BaseCommand):
    help = 'Seeds the database with standardized test subjects (IELTS, TOEFL, GRE, SAT)'

    def handle(self, *args, **options):
        standardized_data = {
            'IELTS': [
                {'name': 'IELTS Reading', 'category': 'LANGUAGES', 'icon': '📖'},
                {'name': 'IELTS Writing', 'category': 'LANGUAGES', 'icon': '📝'},
                {'name': 'IELTS Listening', 'category': 'LANGUAGES', 'icon': '🎧'},
                {'name': 'IELTS Speaking', 'category': 'LANGUAGES', 'icon': '🗣️'},
            ],
            'TOEFL': [
                {'name': 'TOEFL Reading', 'category': 'LANGUAGES', 'icon': '📖'},
                {'name': 'TOEFL Writing', 'category': 'LANGUAGES', 'icon': '📝'},
                {'name': 'TOEFL Listening', 'category': 'LANGUAGES', 'icon': '🎧'},
                {'name': 'TOEFL Speaking', 'category': 'LANGUAGES', 'icon': '🗣️'},
            ],
            'GRE': [
                {'name': 'GRE Verbal Reasoning', 'category': 'HUMANITIES', 'icon': '🗣️'},
                {'name': 'GRE Quantitative Reasoning', 'category': 'STEM', 'icon': '🔢'},
                {'name': 'GRE Analytical Writing', 'category': 'HUMANITIES', 'icon': '✍️'},
            ],
            'SAT': [
                {'name': 'SAT Reading and Writing', 'category': 'LANGUAGES', 'icon': '📚'},
                {'name': 'SAT Math', 'category': 'STEM', 'icon': '📐'},
            ]
        }

        for exam_name, subjects in standardized_data.items():
            self.stdout.write(f"Seeding subjects for {exam_name}...")
            exam_type = ExamType.objects.filter(name__icontains=exam_name).first()
            
            for sub_data in subjects:
                subject, created = Subject.objects.get_or_create(
                    name=sub_data['name'],
                    defaults={
                        'category': sub_data['category'],
                        'icon': sub_data['icon'],
                        'description': f"Specific component for {exam_name}",
                        'is_active': True
                    }
                )
                if created:
                    self.stdout.write(f"  Created subject: {subject.name}")
                else:
                    self.stdout.write(f"  Subject already exists: {subject.name}")

                if exam_type:
                    ExamTypeSubject.objects.get_or_create(
                        exam_type=exam_type,
                        subject=subject,
                        defaults={
                            'is_compulsory': True,
                            'max_questions': 40 if 'IELTS' in exam_name else 60,
                            'duration_minutes': 60
                        }
                    )
                    self.stdout.write(f"    Mapped to {exam_type.name}")

        self.stdout.write(self.style.SUCCESS('Successfully seeded standardized test subjects'))
