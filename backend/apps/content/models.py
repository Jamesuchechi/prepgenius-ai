from django.db import models

class Country(models.Model):
    code = models.CharField(max_length=2, unique=True)
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=50)
    currency = models.CharField(max_length=3)
    is_active = models.BooleanField(default=True)
    launch_date = models.DateField(null=True)
    priority = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "countries"
        ordering = ['priority', 'name']

    def __str__(self):
        return self.name

class ExamBoard(models.Model):
    name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=255)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    is_international = models.BooleanField(default=False)
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='exam_boards/', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.country.name})"

class ExamType(models.Model):
    EXAM_LEVEL_CHOICES = [
        ('PRIMARY', 'Primary School'),
        ('JUNIOR', 'Junior Secondary'),
        ('SENIOR', 'Senior Secondary'),
        ('TERTIARY', 'Tertiary Entry'),
        ('PROFESSIONAL', 'Professional Certification'),
    ]
    
    name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=255)
    exam_board = models.ForeignKey(ExamBoard, on_delete=models.CASCADE)
    level = models.CharField(max_length=20, choices=EXAM_LEVEL_CHOICES)
    duration_minutes = models.IntegerField()
    passing_score = models.IntegerField(null=True)
    max_score = models.IntegerField(null=True)
    description = models.TextField()
    exam_format = models.JSONField()
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['name', 'exam_board']
        ordering = ['name']

    def __str__(self):
        return self.name

class Subject(models.Model):
    CATEGORY_CHOICES = [
        ('STEM', 'Science, Technology, Engineering, Math'),
        ('HUMANITIES', 'Humanities & Social Sciences'),
        ('LANGUAGES', 'Languages'),
        ('ARTS', 'Creative Arts'),
        ('COMMERCE', 'Business & Commerce'),
        ('VOCATIONAL', 'Vocational & Technical'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    icon = models.CharField(max_length=10, default='📚')
    color = models.CharField(max_length=7, default='#FF6B35')
    description = models.TextField()
    is_core = models.BooleanField(default=False)
    aliases = models.JSONField(default=list)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class ExamTypeSubject(models.Model):
    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    is_compulsory = models.BooleanField(default=False)
    max_questions = models.IntegerField()
    duration_minutes = models.IntegerField()
    syllabus_url = models.URLField(blank=True)
    
    class Meta:
        unique_together = ['exam_type', 'subject']

    def __str__(self):
        return f"{self.exam_type.name} - {self.subject.name}"

class Topic(models.Model):
    DIFFICULTY_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    ]
    
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, db_index=True)
    estimated_hours = models.DecimalField(max_digits=4, decimal_places=1)
    description = models.TextField()
    learning_objectives = models.JSONField(default=list)
    prerequisites = models.ManyToManyField('self', symmetrical=False, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    exam_types = models.ManyToManyField(ExamType, through='TopicExamMapping')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['subject', 'order']

    def __str__(self):
        return f"{self.subject.name} - {self.name}"

class Subtopic(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='subtopics')
    name = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    description = models.TextField()
    content_summary = models.TextField()
    key_concepts = models.JSONField(default=list)
    formulas = models.JSONField(default=list)
    examples = models.JSONField(default=list)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['topic', 'order']

    def __str__(self):
        return f"{self.topic.name} - {self.name}"

class TopicExamMapping(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE)
    weight_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    typical_questions = models.IntegerField()
    last_appeared = models.IntegerField(null=True)
    frequency = models.CharField(max_length=20)
    
    class Meta:
        unique_together = ['topic', 'exam_type']

    def __str__(self):
        return f"{self.topic.name} in {self.exam_type.name}"

class Syllabus(models.Model):
    exam_type = models.ForeignKey(ExamType, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    year = models.IntegerField()
    version = models.CharField(max_length=50)
    document_url = models.URLField(blank=True)
    is_current = models.BooleanField(default=True)
    topics = models.ManyToManyField(Topic, through='SyllabusTopic')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['exam_type', 'subject', 'year']
        verbose_name_plural = 'Syllabi'

    def __str__(self):
        return f"{self.exam_type.name} {self.subject.name} {self.year}"

class SyllabusTopic(models.Model):
    syllabus = models.ForeignKey(Syllabus, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    week_number = models.IntegerField(null=True)
    is_compulsory = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.syllabus} - Week {self.week_number}: {self.topic.name}"
