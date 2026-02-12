# Mock Exam Generation: Two Modes

## Overview

The updated exam creation system now offers two distinct modes for generating practice exams:

### Mode 1: **Past Questions** 
Fetches actual past exam questions from the ALOC API for a specific year and caches them for future reuse.

- **User selects:** Subject + Year
- **Flow:** Database (cache first) → ALOC API → Error if insufficient
- **Caching:** All fetched questions are saved to the database
- **Duration:** Defaults to 120 minutes
- **Passing Score:** 40% (customizable via defaults)

### Mode 2: **AI Generated** (Default)
Creates practice questions using AI models with specified format and difficulty distribution.

- **User selects:** Subject + Format (JAMB/WAEC/NABTEB/IGCSE/SAT/Other) + Difficulty percentages
- **Flow:** Database (cache) → AI Generation (Groq/Mistral/etc.)
- **Caching:** All AI-generated questions are saved to the database
- **Duration:** Format-specific defaults (JAMB: 60m, WAEC/NABTEB: 120m, IGCSE: 90m, SAT: 180m)
- **Passing Score:** Format-specific (JAMB: 66%, Others: 50%)

---

## How Caching Works

**All exams—whether from past questions or AI-generated—are saved to the database after creation.**

When a user creates an exam:

1. **Check Database First** - Questions matching (subject, year/format) are retrieved from cache
2. **Fetch Missing Data** - If insufficient:
   - **Past Questions Mode:** Call ALOC API and save results
   - **AI Generated Mode:** Generate via AI and save results
3. **Subsequent Requests** - The same exam parameters will use cached questions, avoiding redundant API/AI calls

---

## Frontend: Create Exam Modal

The create modal now has two tabs:

### Tab 1: "Past Questions"
```
Subject: [Biology, Physics, etc.]
Year: [2023, 2024, etc.]
```
- Fetches past exam questions from ALOC for that specific year
- Number of questions and duration are auto-determined

### Tab 2: "AI Generated"
```
Subject: [Biology, Physics, etc.]
Format: [JAMB, WAEC, NABTEB, IGCSE, SAT, Other]
Questions: [60]
Duration: [60 minutes]
Difficulty:
  - Easy: [20%]
  - Medium: [60%]
  - Hard: [20%]
```
- Generates new questions with specified difficulty distribution
- Format determines default duration and passing score

---

## Backend: API Endpoint

**POST `/exams/create_exam/`**

### Past Questions Request
```json
{
  "subject_name": "Biology",
  "mode": "past_questions",
  "year": 2023
}
```

### AI Generated Request
```json
{
  "subject_name": "Biology",
  "exam_format": "JAMB",
  "mode": "ai_generated",
  "num_questions": 60,
  "duration_minutes": 60,
  "difficulty_distribution": {
    "EASY": 20,
    "MEDIUM": 60,
    "HARD": 20
  }
}
```

---

## Database: Question Caching

All questions are stored in the `Question` model with metadata:

```python
# For Past Questions
question.metadata = {
  "source": "ALOC",
  "year": 2023
}

# For AI Generated
question.metadata = {
  "source": "AI",
  "model": "groq/llama-3.1-8b-instant"
}
```

This metadata enables efficient filtering and cache validation.

---

## Environment Configuration

Required environment variables (already in `.env`):

```env
# ALOC API (for Past Questions mode)
ALOC_BASE_URL=https://questions.aloc.com.ng/api/v2
ALOC_ACCESS_TOKEN=QB-38707161f9b416ce8068
ALOC_TIMEOUT=60

# AI Providers (for AI Generated mode)
GROQ_API_KEY=xxx
GROQ_MODEL=llama-3.1-8b-instant
MISTRAL_API_KEY=xxx
COHERE_API_KEY=xxx
HUGGINGFACE_API_KEY=xxx
```

---

## Error Handling

### Past Questions Mode
- If year has insufficient cached questions and ALOC API fails → User receives error (cannot fall back to AI for past exam mode)
- If ALOC returns partial data → Uses whatever is available

### AI Generated Mode
- If AI generation fails but cached questions exist → Uses cached, fills gaps when time permits
- If completely unable to fetch/generate → Returns error

---

## User Flow Example

### Scenario 1: Create Past Exam (JAMB 2023)
1. User clicks "Create Exam"
2. Selects "Past Questions" mode
3. Enters: Subject = "Biology", Year = 2023
4. System checks DB for Biology questions from 2023
5. If found: Uses cached questions
6. If not found: Calls ALOC API, fetches, caches, and uses them
7. Creates MockExam with retrieved questions

### Scenario 2: Create AI Exam (Custom Format)
1. User clicks "Create Exam"
2. Selects "AI Generated" mode
3. Enters: Subject = "Advanced Physics", Format = "OTHER", 60 questions, 60 min, 20% Easy / 60% Medium / 20% Hard
4. System checks DB for Physics questions in OTHER format
5. If insufficient: Calls AI (Groq/Mistral) to generate remaining
6. Creates Question/Answer records (cached for future)
7. Creates MockExam with all questions

### Scenario 3: Reusing Cached Exam
1. User #2 wants to create same exam as Scenario 1 (Biology JAMB 2023)
2. System finds 60+ cached questions in DB from ALOC (created in Scenario 1)
3. **No API call made** — uses DB instantly
4. Creates new MockExam linked to cached questions

---

## Testing the Implementation

### Manual Test Steps

1. **Start backend server:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Run migrations** (if not done):
   ```bash
   python manage.py migrate
   ```

3. **Test Past Questions Mode:**
   - Open frontend, go to Exams page
   - Click "Create Exam"
   - Select "Past Questions" tab
   - Enter Subject: "Biology", Year: 2023
   - Submit

4. **Test AI Generated Mode:**
   - Click "Create Exam"
   - Select "AI Generated" tab
   - Enter: Subject = "History", Format = "WAEC", adjust difficulty %
   - Submit

5. **Test Caching:**
   - Create the same exam again (same parameters)
   - Should be instant (no AI/API calls)

### API Testing with curl

**Past Questions:**
```bash
curl -X POST http://localhost:8000/exams/create_exam/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "Biology",
    "mode": "past_questions",
    "year": 2023
  }'
```

**AI Generated:**
```bash
curl -X POST http://localhost:8000/exams/create_exam/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "Biology",
    "exam_format": "JAMB",
    "mode": "ai_generated",
    "num_questions": 60,
    "duration_minutes": 60,
    "difficulty_distribution": {"EASY": 20, "MEDIUM": 60, "HARD": 20}
  }'
```

---

## Performance Notes

- **First-time requests** (ALOC/AI): 5-15 seconds (depends on API response time)
- **Cached requests**: < 1 second (pure DB lookup)
- **Database query optimization**: Uses `get_or_create()` to avoid duplicate questions
- **Metadata storage**: Enables efficient filtering by source, year, format

---

## Future Enhancements

- [ ] Bulk import of ALOC questions for multiple years
- [ ] Analytics dashboard showing cache hit rates
- [ ] User preferences for default exam format/difficulty
- [ ] Mixed mode: Past + AI questions in single exam
- [ ] Question deduplication across sources

