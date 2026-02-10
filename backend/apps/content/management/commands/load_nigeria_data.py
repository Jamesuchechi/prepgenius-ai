from django.core.management.base import BaseCommand
from apps.content.models import Country, ExamBoard, ExamType, Subject

class Command(BaseCommand):
    help = 'Loads Nigeria exam boards, types and subjects'

    def handle(self, *args, **options):
        try:
            nigeria = Country.objects.get(code='NG')
        except Country.DoesNotExist:
            self.stdout.write(self.style.ERROR('Nigeria (NG) country not found. Run load_countries first.'))
            return

        # Create Exam Boards
        boards = [
            {'name': 'JAMB', 'full_name': 'Joint Admissions and Matriculation Board', 'is_active': True},
            {'name': 'WAEC', 'full_name': 'West African Examinations Council', 'is_active': True},
            {'name': 'NECO', 'full_name': 'National Examinations Council', 'is_active': True},
            {'name': 'NABTEB', 'full_name': 'National Business and Technical Examinations Board', 'is_active': True},
        ]

        for board_data in boards:
            ExamBoard.objects.get_or_create(
                name=board_data['name'], 
                country=nigeria,
                defaults=board_data
            )
        
        jamb = ExamBoard.objects.get(name='JAMB', country=nigeria)
        waec = ExamBoard.objects.get(name='WAEC', country=nigeria)
        neco = ExamBoard.objects.get(name='NECO', country=nigeria)
        nabteb = ExamBoard.objects.get(name='NABTEB', country=nigeria)

        # Create Exam Types
        exam_types = [
            {
                'name': 'JAMB UTME',
                'full_name': 'Unified Tertiary Matriculation Examination',
                'exam_board': jamb,
                'level': 'TERTIARY',
                'duration_minutes': 240,
                'passing_score': 180,
                'max_score': 400,
                'exam_format': {
                    'sections': 4,
                    'questions_per_section': 60,
                    'question_type': 'MCQ',
                    'time_per_section': 60
                },
                'description': 'Entrance examination for tertiary-level institutions.'
            },
            {
                'name': 'WAEC SSCE',
                'full_name': 'Senior School Certificate Examination',
                'exam_board': waec,
                'level': 'SENIOR',
                'duration_minutes': 0, # Varies
                'exam_format': {'question_types': ['MCQ', 'Theory', 'Essay']},
                'description': 'Final examination for secondary school students.'
            },
             {
                'name': 'NECO SSCE',
                'full_name': 'Senior School Certificate Examination',
                'exam_board': neco,
                'level': 'SENIOR',
                'duration_minutes': 0,
                'exam_format': {'question_types': ['MCQ', 'Theory', 'Essay']},
                'description': 'National examination for secondary school students.'
            },
            {
                'name': 'NABTEB',
                'full_name': 'National Business and Technical Examinations Board',
                'exam_board': nabteb,
                'level': 'SENIOR',
                'duration_minutes': 0,
                'exam_format': {'question_types': ['MCQ', 'Theory', 'Practical']},
                'description': 'Examination for technical and business crafts.'
            },
        ]
        
        for exam_data in exam_types:
            ExamType.objects.get_or_create(
                name=exam_data['name'],
                exam_board=exam_data['exam_board'],
                defaults=exam_data
            )

        # Create Subjects (40 subjects)
        subjects_data = [
            # Core
            {'name': 'English Language', 'category': 'LANGUAGES', 'icon': '📖', 'color': '#0A4D8C', 'is_core': True, 'description': 'Study of English language.'},
            {'name': 'Mathematics', 'category': 'STEM', 'icon': '🔢', 'color': '#FF6B35', 'is_core': True, 'description': 'Study of numbers, quantities, and shapes.'},
            {'name': 'General Studies', 'category': 'HUMANITIES', 'icon': '📚', 'color': '#8B8B8B', 'is_core': True, 'description': 'General knowledge.'},
            
            # Sciences
            {'name': 'Physics', 'category': 'STEM', 'icon': '⚛️', 'color': '#4A90E2', 'description': 'Study of matter and energy.'},
            {'name': 'Chemistry', 'category': 'STEM', 'icon': '🧪', 'color': '#50C878', 'description': 'Study of substances.'},
            {'name': 'Biology', 'category': 'STEM', 'icon': '🧬', 'color': '#90EE90', 'description': 'Study of living organisms.'},
            {'name': 'Agricultural Science', 'category': 'STEM', 'icon': '🌾', 'color': '#8B4513', 'description': 'Science of agriculture.'},
            {'name': 'Health Science', 'category': 'STEM', 'icon': '🏥', 'color': '#FF69B4', 'description': 'Study of health.'},
            {'name': 'Computer Science', 'category': 'STEM', 'icon': '💻', 'color': '#4169E1', 'description': 'Study of computers.'},

            # Social Sciences
            {'name': 'Economics', 'category': 'COMMERCE', 'icon': '📊', 'color': '#FFD700', 'description': 'Social science of production, distribution, and consumption.'},
            {'name': 'Geography', 'category': 'HUMANITIES', 'icon': '🌍', 'color': '#32CD32', 'description': 'Study of places and relationships.'},
            {'name': 'Government', 'category': 'HUMANITIES', 'icon': '🏛️', 'color': '#DC143C', 'description': 'Study of government systems.'},
            {'name': 'Civic Education', 'category': 'HUMANITIES', 'icon': '🗳️', 'color': '#1E90FF', 'description': 'Education in citizenship.'},
            {'name': 'History', 'category': 'HUMANITIES', 'icon': '📜', 'color': '#8B4513', 'description': 'Study of the past.'},
            {'name': 'Commerce', 'category': 'COMMERCE', 'icon': '💼', 'color': '#FF8C00', 'description': 'Study of trade.'},
            {'name': 'Accounting', 'category': 'COMMERCE', 'icon': '💰', 'color': '#228B22', 'description': 'Measurement of financial information.'},

            # Arts/Languages
            {'name': 'Literature in English', 'category': 'LANGUAGES', 'icon': '📚', 'color': '#9370DB', 'description': 'Study of literature.'},
            {'name': 'Yoruba', 'category': 'LANGUAGES', 'icon': '🗣️', 'color': '#FF6347', 'description': 'Yoruba language.'},
            {'name': 'Igbo', 'category': 'LANGUAGES', 'icon': '🗣️', 'color': '#4682B4', 'description': 'Igbo language.'},
            {'name': 'Hausa', 'category': 'LANGUAGES', 'icon': '🗣️', 'color': '#32CD32', 'description': 'Hausa language.'},
            {'name': 'French', 'category': 'LANGUAGES', 'icon': '🇫🇷', 'color': '#0055A4', 'description': 'French language.'},
            {'name': 'Christian Religious Studies', 'category': 'HUMANITIES', 'icon': '✝️', 'color': '#FFD700', 'description': 'Study of Christianity.'},
            {'name': 'Islamic Religious Studies', 'category': 'HUMANITIES', 'icon': '☪️', 'color': '#009900', 'description': 'Study of Islam.'},
            
            # Vocational
            {'name': 'Data Processing', 'category': 'VOCATIONAL', 'icon': '🖥️', 'color': '#4169E1', 'description': 'Processing of data.'},
            {'name': 'Technical Drawing', 'category': 'VOCATIONAL', 'icon': '📐', 'color': '#FF4500', 'description': 'Technical drawing.'},
            {'name': 'Auto Mechanics', 'category': 'VOCATIONAL', 'icon': '🚗', 'color': '#C0C0C0', 'description': 'Automobile mechanics.'},
            {'name': 'Electrical Installation', 'category': 'VOCATIONAL', 'icon': '⚡', 'color': '#FFD700', 'description': 'Electrical installation.'},
            {'name': 'Building Construction', 'category': 'VOCATIONAL', 'icon': '🏗️', 'color': '#8B4513', 'description': 'Construction of buildings.'},
            {'name': 'Catering Craft Practice', 'category': 'VOCATIONAL', 'icon': '🍳', 'color': '#FF69B4', 'description': 'Catering.'},
            {'name': 'Cosmetology', 'category': 'VOCATIONAL', 'icon': '💄', 'color': '#FF1493', 'description': 'Cosmetology.'},
            {'name': 'Marketing', 'category': 'COMMERCE', 'icon': '📢', 'color': '#FF8C00', 'description': 'Marketing.'},
            {'name': 'Office Practice', 'category': 'COMMERCE', 'icon': '🏢', 'color': '#708090', 'description': 'Office practice.'},
            {'name': 'Home Economics', 'category': 'VOCATIONAL', 'icon': '🏠', 'color': '#FF69B4', 'description': 'Home economics.'},
            {'name': 'Woodwork', 'category': 'VOCATIONAL', 'icon': '🪵', 'color': '#8B4513', 'description': 'Woodwork.'},
            {'name': 'Metal Work', 'category': 'VOCATIONAL', 'icon': '🔨', 'color': '#C0C0C0', 'description': 'Metal work.'},
            {'name': 'Printing', 'category': 'VOCATIONAL', 'icon': '🖨️', 'color': '#4B0082', 'description': 'Printing.'},
            {'name': 'Dyeing and Bleaching', 'category': 'VOCATIONAL', 'icon': '🎨', 'color': '#FF00FF', 'description': 'Dyeing and bleaching.'},
            {'name': 'Clothing and Textiles', 'category': 'VOCATIONAL', 'icon': '👗', 'color': '#DA70D6', 'description': 'Clothing and textiles.'},
            {'name': 'Food and Nutrition', 'category': 'VOCATIONAL', 'icon': '🍎', 'color': '#32CD32', 'description': 'Food and nutrition.'},
            {'name': 'Animal Husbandry', 'category': 'STEM', 'icon': '🐄', 'color': '#8B4513', 'description': 'Animal husbandry.'},
        ]
        
        for data in subjects_data:
            Subject.objects.get_or_create(name=data['name'], defaults=data)
        
        self.stdout.write(self.style.SUCCESS('Nigeria data loaded!'))
