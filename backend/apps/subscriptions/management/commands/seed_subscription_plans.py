from django.core.management.base import BaseCommand
from decimal import Decimal
from apps.subscriptions.models import SubscriptionPlan


class Command(BaseCommand):
    help = 'Seed subscription plans into the database'

    def handle(self, *args, **options):
        """Create default subscription plans."""
        
        plans = [
            {
                'name': 'free',
                'display_name': 'Free Tier',
                'price': Decimal('0.00'),
                'duration_days': 0,
                'questions_per_day': 10,
                'has_mock_exams': False,
                'has_ai_tutor': False,
                'has_audio_mode': False,
                'has_document_mode': False,
                'has_offline_mode': False,
                'has_premium_content': False,
                'has_priority_support': False,
                'study_sessions_per_month': 0,
                'max_topics': 0,
                'description': 'Perfect for exploring PrepGenius. Practice 10 questions daily and track your progress.',
                'is_active': True,
            },
            {
                'name': 'weekly',
                'display_name': 'Weekly Plan (₦800)',
                'price': Decimal('800.00'),
                'duration_days': 7,
                'questions_per_day': 0,  # Unlimited
                'has_mock_exams': True,
                'has_ai_tutor': True,
                'has_audio_mode': False,
                'has_document_mode': False,
                'has_offline_mode': False,
                'has_premium_content': False,
                'has_priority_support': False,
                'study_sessions_per_month': 0,  # Unlimited
                'max_topics': 0,  # Unlimited
                'description': 'Short-term access to all core features. Great for last-minute revision.',
                'is_active': True,
            },
            {
                'name': 'monthly',
                'display_name': 'Monthly Plan (₦2,500)',
                'price': Decimal('2500.00'),
                'duration_days': 30,
                'questions_per_day': 0,  # Unlimited
                'has_mock_exams': True,
                'has_ai_tutor': True,
                'has_audio_mode': False,
                'has_document_mode': False,
                'has_offline_mode': False,
                'has_premium_content': False,
                'has_priority_support': False,
                'study_sessions_per_month': 0,  # Unlimited
                'max_topics': 0,  # Unlimited
                'description': 'Unlock unlimited questions and access to mock exams + AI tutor for 1 month.',
                'is_active': True,
            },
            {
                'name': 'quarterly',
                'display_name': 'Quarterly Plan (₦6,000)',
                'price': Decimal('6000.00'),
                'duration_days': 90,
                'questions_per_day': 0,  # Unlimited
                'has_mock_exams': True,
                'has_ai_tutor': True,
                'has_audio_mode': False,
                'has_document_mode': False,
                'has_offline_mode': False,
                'has_premium_content': False,
                'has_priority_support': True,
                'study_sessions_per_month': 0,  # Unlimited
                'max_topics': 0,  # Unlimited
                'description': 'Everything in Monthly plus priority support for 3 months. Best value!',
                'is_active': True,
            },
            {
                'name': 'bi_annual',
                'display_name': 'Bi-Annual Plan (₦11,000)',
                'price': Decimal('11000.00'),
                'duration_days': 180,
                'questions_per_day': 0,  # Unlimited
                'has_mock_exams': True,
                'has_ai_tutor': True,
                'has_audio_mode': True,
                'has_document_mode': True,
                'has_offline_mode': True,
                'has_premium_content': True,
                'has_priority_support': True,
                'study_sessions_per_month': 0,  # Unlimited
                'max_topics': 0,  # Unlimited
                'description': 'Semester-long access with all premium features including offline mode.',
                'is_active': True,
            },
            {
                'name': 'annual',
                'display_name': 'Annual Plan (₦20,000)',
                'price': Decimal('20000.00'),
                'duration_days': 365,
                'questions_per_day': 0,  # Unlimited
                'has_mock_exams': True,
                'has_ai_tutor': True,
                'has_audio_mode': True,
                'has_document_mode': True,
                'has_offline_mode': True,
                'has_premium_content': True,
                'has_priority_support': True,
                'study_sessions_per_month': 0,  # Unlimited
                'max_topics': 0,  # Unlimited
                'description': 'Complete access to all features including audio mode, document analysis, offline learning, and premium content for 1 full year.',
                'is_active': True,
            },
        ]

        created_count = 0
        updated_count = 0

        for plan_data in plans:
            plan, created = SubscriptionPlan.objects.update_or_create(
                name=plan_data['name'],
                defaults=plan_data
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Created subscription plan: {plan.display_name}'
                    )
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(
                        f'↻ Updated subscription plan: {plan.display_name}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully seeded {created_count} new plans and updated {updated_count} existing plans.'
            )
        )
