# Content App

The `content` app is responsible for managing the educational hierarchy and curriculum data of PrepGenius AI.

## Purpose
It standardizes how subjects, exams, and topics are stored, allowing for a scalable system that can support multiple countries and curriculum standards.

## Key Models
- **Geographic**: `Country`
- **Organizational**: `ExamBoard`, `ExamType`
- **Academic**: `Subject`, `Topic`, `Subtopic`
- **Curriculum**: `Syllabus`, `TopicExamMapping`

## Management Commands
Use these commands to seed the database:

1. `python manage.py load_countries` - Loads African countries.
2. `python manage.py load_nigeria_data` - Loads Nigeria specific exams and subjects.
3. `python manage.py load_math_topics` - Loads detailed Mathematics topics.

## API
See `docs/content_api.md` for API endpoint details.
