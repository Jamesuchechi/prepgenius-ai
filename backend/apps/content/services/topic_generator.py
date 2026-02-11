import logging
from django.db import transaction
from ai_services.router import AIRouter
from apps.content.models import Subject, Topic

logger = logging.getLogger(__name__)

class TopicGenerationService:
    def __init__(self):
        self.ai_router = AIRouter()

    def get_or_generate_topics(self, subject_name):
        """
        Get existing topics for a subject or generate new ones using AI.
        """
        # Normalize subject name (title case for consistency)
        subject_name = subject_name.strip().title()
        
        # 1. Get or Create Subject
        # We use a broad category default if creating new, or ideally let admin refine later
        subject, created = Subject.objects.get_or_create(
            name__iexact=subject_name,
            defaults={
                'name': subject_name,
                'category': 'STEM', # Default to STEM, can be updated
                'description': f"Study material for {subject_name}",
                'icon': '📚' 
            }
        )
        
        if created:
            logger.info(f"Created new subject: {subject.name}")
        else:
            # If subject exists, check if it has topics
            existing_topics = Topic.objects.filter(subject=subject, is_active=True)
            if existing_topics.exists():
                logger.info(f"Returning {existing_topics.count()} existing topics for {subject.name}")
                return existing_topics

        # 2. Generate Topics via AI
        logger.info(f"Generating topics for {subject.name} via AI...")
        try:
            generated_data = self.ai_router.generate_topics(subject.name)
            
            topics_data = generated_data.get('topics', [])
            if not topics_data:
                logger.warning(f"AI returned no topics for {subject.name}")
                return []

            # 3. Save Topics to DB
            new_topics = []
            with transaction.atomic():
                for i, t_data in enumerate(topics_data):
                    topic = Topic.objects.create(
                        subject=subject,
                        name=t_data.get('name', f"Topic {i+1}"),
                        description=t_data.get('description', ''),
                        difficulty=t_data.get('difficulty', 'BEGINNER').upper(),
                        estimated_hours=t_data.get('estimated_hours', 1.0),
                        order=i+1
                    )
                    new_topics.append(topic)
            
            logger.info(f"Successfully generated and saved {len(new_topics)} topics for {subject.name}")
            return new_topics

        except Exception as e:
            logger.error(f"Failed to generate topics for {subject.name}: {e}")
            # If AI fails but we created the subject, we might want to keep it or delete it?
            # For now, keeping it is fine.
            raise e
