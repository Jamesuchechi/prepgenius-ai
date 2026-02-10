# Content App Database Schema

The `content` app manages the educational structure of the platform. Here is an overview of the data models.

## Models

### 1. Country
Represents a country where the platform operates.
- `code`: ISO code (e.g., NG)
- `name`: Full name
- `region`: Geographical region
- `currency`: Currency code

### 2. ExamBoard
An organization that conducts exams (e.g., JAMB, WAEC).
- `name`: Short name
- `country`: ForeignKey to Country

### 3. ExamType
A specific examination offered by a board (e.g., UTME, SSCE).
- `name`: Exam name
- `exam_board`: ForeignKey to ExamBoard
- `level`: PRIMARY, JUNIOR, SENIOR, TERTIARY, PROFESSIONAL

### 4. Subject
An academic subject (e.g., Mathematics).
- `name`: Subject name
- `category`: STEM, HUMANITIES, etc.
- `is_core`: Boolean indicating if it's a core subject

### 5. ExamTypeSubject
Many-to-Many link between ExamType and Subject. defines which subjects are available for a specific exam.
- `exam_type`: ForeignKey
- `subject`: ForeignKey
- `is_compulsory`: If the subject is mandatory for this exam.

### 6. Topic
A major topic within a subject (e.g., Algebra).
- `subject`: ForeignKey
- `name`: Topic name
- `difficulty`: BEGINNER, INTERMEDIATE, ADVANCED

### 7. Subtopic
A smaller unit within a topic.
- `topic`: ForeignKey
- `name`: Subtopic name
- `content_summary`: Text summary

### 8. TopicExamMapping
Maps topics to exams with specific weights. This allows reusing topics across exams (e.g., Algebra in JAMB vs WAEC) while defining their importance per exam.
- `topic`: ForeignKey
- `exam_type`: ForeignKey
- `weight_percentage`: Importance in this exam.

### 9. Syllabus
Represents an official syllabus version for a specific exam and subject year.
- `exam_type`: ForeignKey
- `subject`: ForeignKey
- `year`: Syllabus year

### 10. SyllabusTopic
Links a Syllabus to Topics, optionally with a week number for study planning.
- `syllabus`: ForeignKey
- `topic`: ForeignKey
- `week_number`: Recommended week to study.
