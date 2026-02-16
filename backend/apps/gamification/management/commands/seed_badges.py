from django.core.management.base import BaseCommand
from apps.gamification.models import Badge

class Command(BaseCommand):
    help = 'Seed initial badges for the gamification system'

    def handle(self, *args, **options):
        badges = [
            # Streak Badges
            {
                'name': 'Early Bird',
                'slug': 'early-bird',
                'description': 'Study for 3 consecutive days.',
                'icon_name': 'Zap',
                'points_award': 50,
                'category': 'streak',
                'threshold': 3
            },
            {
                'name': 'Consistent Learner',
                'slug': 'consistent-learner',
                'description': 'Keep a 7-day study streak alive.',
                'icon_name': 'Flame',
                'points_award': 150,
                'category': 'streak',
                'threshold': 7
            },
            # Quiz Badges
            {
                'name': 'First Victory',
                'slug': 'first-victory',
                'description': 'Complete your first quiz.',
                'icon_name': 'Trophy',
                'points_award': 20,
                'category': 'quiz',
                'threshold': 1
            },
            {
                'name': 'Quiz Master',
                'slug': 'quiz-master',
                'description': 'Successfully complete 10 quizzes.',
                'icon_name': 'Medal',
                'points_award': 100,
                'category': 'quiz',
                'threshold': 10
            },
            # Study Time Badges
            {
                'name': 'Dedicated Student',
                'slug': 'dedicated-student',
                'description': 'Spend 60 minutes studying.',
                'icon_name': 'Clock',
                'points_award': 50,
                'category': 'time',
                'threshold': 60
            },
            {
                'name': 'Master of Focus',
                'slug': 'master-of-focus',
                'description': 'Log 5 hours of total study time.',
                'icon_name': 'Brain',
                'points_award': 250,
                'category': 'time',
                'threshold': 300
            }
        ]

        for b_data in badges:
            badge, created = Badge.objects.get_or_create(
                slug=b_data['slug'],
                defaults=b_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created badge: {badge.name}'))
            else:
                self.stdout.write(f'Badge already exists: {badge.name}')
