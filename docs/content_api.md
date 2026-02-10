# Content API Documentation

This document outlines the API endpoints available in the `content` app for accessing countries, exam boards, exam types, subjects, and topics.

## Base URL
`/api/content/`

## Endpoints

### Countries

- **GET /countries/**
    - List all active countries.
    - **Query Params:**
        - `region`: Filter by region (e.g., "West Africa")
        - `is_active`: Filter by active status (true/false)
        - `search`: Search by name or code
    - **Response:**
        ```json
        [
            {
                "id": 1,
                "code": "NG",
                "name": "Nigeria",
                "region": "West Africa",
                "currency": "NGN",
                "is_active": true
            }
        ]
        ```

- **GET /countries/{id}/**
    - Retrieve details of a specific country.

### Exam Boards

- **GET /exam-boards/**
    - List all exam boards.
    - **Query Params:**
        - `country`: Filter by country ID
        - `is_international`: Filter by international status
        - `search`: Search by name or full_name
    - **Response:**
        ```json
        [
            {
                "id": 1,
                "name": "JAMB",
                "full_name": "Joint Admissions and Matriculation Board",
                "country": { ... }
            }
        ]
        ```

### Exam Types

- **GET /exam-types/**
    - List all exam types.
    - **Query Params:**
        - `exam_board__country__code`: Filter by country code (e.g., "NG")
        - `level`: Filter by exam level (e.g., "TERTIARY")
        - `search`: Search by name
    - **Response:**
        ```json
        [
            {
                "id": 1,
                "name": "JAMB UTME",
                "level": "TERTIARY",
                "exam_board": { ... }
            }
        ]
        ```

### Subjects

- **GET /subjects/**
    - List all subjects.
    - **Query Params:**
        - `category`: Filter by category (e.g., "STEM")
        - `is_core`: Filter by core status
        - `search`: Search by name
    - **Response:**
        ```json
        [
            {
                "id": 1,
                "name": "Mathematics",
                "category": "STEM",
                "topics_count": 20
            }
        ]
        ```

- **GET /subjects/{id}/**
    - Retrieve subject details including full list of topics.

### Topics

- **GET /topics/**
    - List topics.
    - **Query Params:**
        - `subject`: Filter by subject ID
        - `difficulty`: Filter by difficulty
        - `search`: Search by name or description
    - **Response:**
        ```json
        [
            {
                "id": 1,
                "name": "Quadratic Equations",
                "subject": 1,
                "difficulty": "INTERMEDIATE"
            }
        ]
        ```

- **GET /topics/{id}/**
    - Retrieve topic details including subtopics.

### Subtopics

- **GET /subtopics/**
    - List subtopics.
    - **Query Params:**
        - `topic`: Filter by topic ID
