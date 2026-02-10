from django.core.management.base import BaseCommand
from apps.content.models import Subject, Topic, Subtopic
import decimal

class Command(BaseCommand):
    help = 'Loads Mathematics topics'

    def handle(self, *args, **options):
        try:
            math_subject = Subject.objects.get(name='Mathematics')
        except Subject.DoesNotExist:
            self.stdout.write(self.style.ERROR('Mathematics subject not found. Run load_nigeria_data first.'))
            return

        # Detailed Topics from the prompt
        topics_data = [
            {
                'name': 'Number and Numeration', 'order': 1, 'difficulty': 'BEGINNER',
                'description': 'Study of numbers, their properties and operations.',
                'subtopics': [
                    'Number Bases (Binary, Octal, Decimal, Hexadecimal)',
                    'Fractions, Decimals, and Approximations',
                    'Indices, Logarithms, and Surds',
                    'Sets and Venn Diagrams',
                    'Ratio, Proportion, and Percentages'
                ]
            },
            {
                'name': 'Algebraic Processes', 'order': 2, 'difficulty': 'INTERMEDIATE',
                'description': 'Operations and manipulations of algebraic expressions.',
                'subtopics': [
                    'Simplification and Expansion',
                    'Factorization',
                    'Change of Subject of Formula',
                    'Solving Linear Equations'
                ]
            },
            {
                'name': 'Quadratic Equations', 'order': 3, 'difficulty': 'INTERMEDIATE',
                'description': 'Equations of the second degree.',
                'subtopics': [
                    'Solving by Factorization',
                    'Completing the Square',
                    'Quadratic Formula',
                    'Graphing Parabolas',
                    'Word Problems with Quadratics'
                ]
            },
            {
                'name': 'Variation', 'order': 4, 'difficulty': 'INTERMEDIATE',
                'description': 'Relationships between variables.',
                'subtopics': ['Direct Variation', 'Inverse Variation', 'Joint and Partial Variation']
            },
            {
                'name': 'Sequences and Series', 'order': 5, 'difficulty': 'ADVANCED',
                'description': 'Ordered lists of numbers.',
                'subtopics': ['Arithmetic Progression (AP)', 'Geometric Progression (GP)', 'Sum of n Terms']
            },
            {
                'name': 'Inequalities', 'order': 6, 'difficulty': 'INTERMEDIATE',
                'description': 'Mathematical sentences comparing two expressions.',
                'subtopics': ['Linear Inequalities', 'Quadratic Inequalities', 'Graphical Solutions']
            },
            {
                'name': 'Coordinate Geometry', 'order': 7, 'difficulty': 'ADVANCED',
                'description': 'Geometry using coordinate system.',
                'subtopics': ['Distance Between Two Points', 'Midpoint Formula', 'Gradient and Equation of a Line', 'Parallel and Perpendicular Lines']
            },
            {
                'name': 'Mensuration', 'order': 8, 'difficulty': 'INTERMEDIATE',
                'description': 'Measurement of geometric figures.',
                'subtopics': ['Perimeter and Area (2D shapes)', 'Surface Area and Volume (3D shapes)', 'Arc Length and Sector Area']
            },
            {
                'name': 'Trigonometry I', 'order': 9, 'difficulty': 'INTERMEDIATE',
                'description': 'Relationships between side lengths and angles of triangles.',
                'subtopics': ['SOHCAHTOA (Right-angled triangles)', 'Angles of Elevation and Depression', 'Bearings']
            },
            {
                'name': 'Trigonometry II', 'order': 10, 'difficulty': 'ADVANCED',
                'description': 'Advanced trigonometry.',
                'subtopics': ['Sine Rule', 'Cosine Rule', 'Area of Triangle (½ab sin C)']
            },
            {
                'name': 'Circle Theorems', 'order': 11, 'difficulty': 'ADVANCED',
                'description': 'Properties of angles in circles.',
                'subtopics': ['Angles in a Circle', 'Tangent Properties', 'Chord Properties']
            },
            {
                'name': 'Graphs of Functions', 'order': 12, 'difficulty': 'INTERMEDIATE',
                'description': 'Visual representation of functions.',
                'subtopics': ['Linear Graphs', 'Quadratic Graphs', 'Exponential and Logarithmic Graphs']
            },
            {
                'name': 'Calculus', 'order': 13, 'difficulty': 'ADVANCED',
                'description': 'Differentiation and Integration.',
                'subtopics': ['Differentiation (First Principles)', 'Gradient of Curves', 'Maximum and Minimum Points', 'Integration (Area under curves)']
            },
            {
                'name': 'Statistics I', 'order': 14, 'difficulty': 'BEGINNER',
                'description': 'Collection and analysis of data.',
                'subtopics': ['Measures of Central Tendency (Mean, Median, Mode)', 'Range and Standard Deviation', 'Frequency Tables']
            },
            {
                'name': 'Statistics II', 'order': 15, 'difficulty': 'INTERMEDIATE',
                'description': 'Graphical representation of data.',
                'subtopics': ['Histograms and Bar Charts', 'Pie Charts', 'Cumulative Frequency Curves']
            },
            {
                'name': 'Probability', 'order': 16, 'difficulty': 'INTERMEDIATE',
                'description': 'Study of chance.',
                'subtopics': ['Simple Probability', 'Addition and Multiplication Rules', 'Tree Diagrams']
            },
            {
                'name': 'Matrices and Determinants', 'order': 17, 'difficulty': 'ADVANCED',
                'description': 'Rectangular arrays of numbers.',
                'subtopics': ['Matrix Operations', 'Determinants (2×2 and 3×3)', 'Inverse of a Matrix']
            },
            {
                'name': 'Vectors', 'order': 18, 'difficulty': 'ADVANCED',
                'description': 'Quantities with magnitude and direction.',
                'subtopics': ['Vector Notation', 'Magnitude and Direction', 'Vector Addition and Subtraction']
            },
             {
                'name': 'Linear Programming', 'order': 19, 'difficulty': 'ADVANCED',
                'description': 'Optimizing a linear objective function.',
                'subtopics': ['Graphical Method', 'Optimization Problems']
            },
            {
                'name': 'Logic and Sets', 'order': 20, 'difficulty': 'BEGINNER',
                'description': 'Mathematical logic.',
                'subtopics': ['Logical Connectives', 'Truth Tables', 'Set Operations']
            },
        ]

        for topic_data in topics_data:
            topic, created = Topic.objects.get_or_create(
                subject=math_subject,
                name=topic_data['name'],
                defaults={
                    'order': topic_data['order'],
                    'difficulty': topic_data['difficulty'],
                    'description': topic_data['description'],
                    'estimated_hours': decimal.Decimal('2.0')
                }
            )
            
            for index, sub_name in enumerate(topic_data['subtopics']):
                Subtopic.objects.get_or_create(
                    topic=topic,
                    name=sub_name,
                    defaults={
                        'order': index + 1,
                        'description': f"Subtopic {sub_name} of {topic.name}",
                        'content_summary': f"Content for {sub_name}"
                    }
                )
        
        self.stdout.write(self.style.SUCCESS('Math topics loaded!'))
