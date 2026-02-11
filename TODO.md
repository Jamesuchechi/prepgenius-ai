# PrepGenius AI - Development TODO

> **Usage**: Reference this file when starting work. Simply say "Let's work on TODO #5" or "Start Phase 1, Item 2"

---

## 🎯 PHASE 1: FOUNDATION & MVP (Weeks 1-4)



### TODO #1: Project Setup & Infrastructure
**Status**: 🔴 Not Started  
**Priority**: CRITICAL  
**Estimated Time**: 

- [ ] Initialize Git repository
- [ ] Set up project structure (backend/frontend folders)
- [ ] Create virtual environment for Python
- [ ] Initialize Django project with proper settings structure
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up PostgreSQL database locally(for development we will use sqlite)
- [ ] Install and configure Redis
- [ ] Create `.env.example` files for both backend and frontend
- [ ] Set up `.gitignore` files
- [ ] Create initial `requirements.txt` and `package.json`
- [ ] Test basic server runs (Django + Next.js)

**Deliverables**: Working local development environment

---

### TODO #2: User Authentication System
**Status**: 🔴 Not Started  
**Priority**: CRITICAL  
**Estimated Time**: 

**Backend Tasks:**
- [ ] Create `accounts` app in Django
- [ ] Design User model with custom fields (student_type, exam_target, grade_level)
- [ ] Implement JWT authentication with djangorestframework-simplejwt
- [ ] Create registration endpoint with email verification
- [ ] Create login/logout endpoints
- [ ] Implement password reset flow (email-based)
- [ ] Add user profile endpoints (GET, PATCH)
- [ ] Write unit tests for auth endpoints

**Frontend Tasks:**
- [ ] Create authentication context/provider
- [ ] Build Sign Up page with form validation
- [ ] Build Sign In page
- [ ] Build Email Verification page
- [ ] Build Password Reset flow pages
- [ ] Implement protected route wrapper
- [ ] Add authentication state management (Zustand)
- [ ] Create user profile page

Connect to Django backend API
Implement JWT authentication
Add CSRF protection
Secure password validation
Add rate limiting
Implement session management
Add 2FA option
**API Endpoints:**
```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/refresh/
POST /api/auth/password-reset/
POST /api/auth/password-reset-confirm/
GET  /api/auth/verify-email/:token/
GET  /api/users/me/
PATCH /api/users/me/
```

**Deliverables**: Complete authentication system with email verification

---

### TODO #3: Subject & Exam Type Setup
**Status**: 🔴 Not Started  
**Priority**: HIGH  
**Estimated Time**: 

**Backend Tasks:**
- [ ] Create `content` app
- [ ] Design models: Subject, ExamType, Topic, Subtopic
- [ ] Seed database with JAMB subjects (Mathematics, English, Physics, Chemistry, Biology, etc.)
- [ ] Seed database with exam types (JAMB, WAEC, NECO)
- [ ] Create syllabus structure for each subject
- [ ] Create API endpoints for subjects and exam types
- [ ] Add admin panel configuration for content management

**Frontend Tasks:**
- [ ] Create subject selection interface (onboarding)
- [ ] Create exam type selection interface
- [ ] Build syllabus browser component
- [ ] Store user's selected subjects in profile

**API Endpoints:**
```
GET /api/subjects/
GET /api/exam-types/
GET /api/subjects/:id/topics/
GET /api/topics/:id/subtopics/
POST /api/users/me/subjects/  (select subjects)
```


**Deliverables**: Content structure with JAMB/WAEC syllabus data

---

### TODO #4: AI Question Generation System
**Status**: 🔴 Not Started  
**Priority**: CRITICAL  

**Backend Tasks:**
- [ ] Create `questions` app
- [ ] Design models: Question, Answer, QuestionAttempt
- [ ] Set up AI service layer (ai_services/)
- [ ] Implement Groq API client (free tier)
- [ ] Implement Mistral API client (fallback)
- [ ] Implement HuggingFace API client (fallback)
- [ ] Implement Cohere API client (fallback)
- [ ] Implement Question choice(true or false, multiple choice, theory, fill in the blanks, match the following, ordering, writing(or solving))
- [ ] Create prompt templates for question generation
- [ ] Build question generation endpoint with difficulty levels
- [ ] Implement question caching system (Redis)
- [ ] Add rate limiting for AI calls
- [ ] Create question validation logic
- [ ] Build question difficulty calibration system

**Prompt Engineering:**
- [ ] Write prompt for multiple-choice questions
- [ ] Write prompt for theory questions
- [ ] Write prompt for true or false questions
- [ ] Write prompt for fill in the blanks questions
- [ ] Write prompt for match the following questions
- [ ] Write prompt for ordering questions
- [ ] Write prompt for writing(or solving) questions
- [ ] Write prompt for step-by-step explanations
- [ ] Test and refine prompts for JAMB-style accuracy

**Frontend Tasks:**
- [ ] Create practice question interface
- [ ] Build question card component (MCQ, Theory, True or False, Fill in the Blanks, Match the Following, Ordering, Writing(or Solving))
- [ ] Implement answer submission flow
- [ ] Create results page with explanations
- [ ] Add loading states for AI generation
- [ ] Build question history view

**API Endpoints:**
```
POST /api/questions/generate/
GET  /api/questions/
POST /api/questions/:id/attempt/
GET  /api/questions/my-attempts/
GET  /api/questions/:id/explanation/
```

**AI Integration:**
```python
# Example prompt structure
{
    "subject": "Mathematics",
    "topic": "Quadratic Equations",
    "difficulty": "medium",
    "exam_type": "JAMB",
    "question_type": "multiple_choice",
    "num_questions": 5
}
```

**Deliverables**: Working AI question generation for Mathematics (JAMB)

---

### TODO #5: Progress Tracking & Analytics
**Status**: 🟢 Completed  
**Priority**: HIGH  

**Backend Tasks:**
- [x] Create `analytics` app
- [x] Design models: ProgressTracker, TopicMastery, StudySession
- [x] Implement progress calculation algorithms
- [x] Create weakness detection logic
- [x] Build performance analytics endpoints
- [x] Calculate topic mastery percentages
- [x] Track time spent per topic
- [x] Implement accuracy trends calculation

**Frontend Tasks:**
- [x] make sure that the dashboard(hompage) is rendering real analytics data and not placeholder data
- [x] Set up analytics dashboard layout
- [x] Create analytics dashboard page
- [x] Build performance overview card
- [x] Create topic mastery visualization
- [x] Add weakness detection display
- [x] Implement performance history timeline
- [x] Create study time tracker display
- [x] Build subject-wise performance breakdown
- [x] Add responsive design for mobile
- [x] Create analytics dashboard page
- [x] Build performance overview card
- [x] Create topic mastery visualization
- [x] Build progress charts (Recharts)
- [x] Build weakness detection display
- [x] Add performance history timeline
- [x] Create study time tracker display
- [x] Build subject-wise performance breakdown

**API Endpoints:**
```
GET /api/analytics/overview/
GET /api/analytics/topic-mastery/
GET /api/analytics/weak-areas/
GET /api/analytics/performance-history/
GET /api/analytics/study-sessions/
POST /api/analytics/log-session/
```

**Deliverables**: Student dashboard with performance insights

---

### TODO #6: Basic Study Plan Generator
**Status**: 🔴 Not Started  
**Priority**: MEDIUM  

**Backend Tasks:**
- [ ] Create `study_plans` app
- [ ] Design StudyPlan and StudyTask models
- [ ] Implement AI-based study plan generation
- [ ] Create daily/weekly schedule logic
- [ ] Add exam date countdown
- [ ] Build study plan adjustment based on performance
- [ ] Create reminders system 

**Frontend Tasks:**
- [ ] Create study plan page
- [ ] Build calendar view for schedule
- [ ] Create task completion interface
- [ ] Add study plan customization options
- [ ] Display daily study goals

**API Endpoints:**
```
POST /api/study-plans/generate/
GET  /api/study-plans/current/
PATCH /api/study-plans/:id/
POST /api/study-plans/tasks/:id/complete/
```

**Deliverables**: Personalized study plan generation

---

## 🚀 PHASE 2: CORE FEATURES (Weeks 5-8)

### TODO #7: Mock Exam System
**Status**: 🔴 Not Started  
**Priority**: HIGH  
**Estimated Time**: 5-6 days

**Backend Tasks:**
- [ ] Create `exams` app
- [ ] Design models: MockExam, ExamAttempt, ExamResult
- [ ] Build exam paper generation (JAMB format: 60 questions, 60 mins)
- [ ] Implement timer system (server-side validation)
- [ ] Create auto-grading system
- [ ] Build result analysis engine
- [ ] Generate performance reports
- [ ] Implement exam history tracking

**Frontend Tasks:**
- [ ] Create exam lobby page
- [ ] Build timed exam interface
- [ ] Implement exam timer with auto-submit
- [ ] Create question navigation grid
- [ ] Build exam review page
- [ ] Display detailed results with analytics
- [ ] Add exam history page

**API Endpoints:**
```
POST /api/exams/create/
GET  /api/exams/
POST /api/exams/:id/start/
POST /api/exams/:id/submit/
GET  /api/exams/:id/result/
GET  /api/exams/my-attempts/
```

**Deliverables**: Full mock exam functionality with JAMB structure

---

### TODO #8: AI Chat Tutor
**Status**: 🔴 Not Started  
**Priority**: MEDIUM  
**Estimated Time**: 4-5 days

**Backend Tasks:**
- [ ] Create `ai_tutor` app
- [ ] Implement WebSocket support (Django Channels)
- [ ] Design ChatSession and ChatMessage models
- [ ] Build conversational AI system
- [ ] Implement context-aware responses
- [ ] Add chat history storage
- [ ] Create rate limiting for chat
- [ ] Build moderation system

**Frontend Tasks:**
- [ ] Create chat interface component
- [ ] Implement real-time messaging (WebSocket)
- [ ] Add typing indicators
- [ ] Build chat history view
- [ ] Create suggested questions feature
- [ ] Add markdown rendering for responses

**WebSocket Endpoint:**
```
WS /ws/chat/:session_id/
```

**API Endpoints:**
```
POST /api/chat/sessions/
GET  /api/chat/sessions/
GET  /api/chat/sessions/:id/messages/
DELETE /api/chat/sessions/:id/
```

**Deliverables**: Real-time AI tutor chat

---

### TODO #9: Advanced Analytics & Insights
**Status**: 🔴 Not Started  
**Priority**: MEDIUM  
**Estimated Time**: 3-4 days

**Features to Add:**
- [ ] Predicted score estimation
- [ ] Learning pattern analysis
- [ ] Optimal study time detection
- [ ] Spaced repetition scheduling
- [ ] Comparative performance (anonymized peer data)
- [ ] Strength/weakness heatmaps
- [ ] Weekly progress reports

**Deliverables**: Advanced analytics dashboard

---

### TODO #10: Gamification System
**Status**: 🔴 Not Started  
**Priority**: LOW  
**Estimated Time**: 3 days

**Features:**
- [ ] Daily study streaks
- [ ] Achievement badges
- [ ] Points system
- [ ] Leaderboards (optional, privacy-aware)
- [ ] Milestone celebrations
- [ ] Challenge system

**Deliverables**: Engagement features to boost retention

---

## 💰 PHASE 3: MONETIZATION (Weeks 9-10)

### TODO #11: Subscription System
**Status**: 🔴 Not Started  
**Priority**: HIGH  
**Estimated Time**: 4-5 days

**Backend Tasks:**
- [ ] Create `subscriptions` app
- [ ] Design SubscriptionPlan and UserSubscription models
- [ ] Integrate Paystack payment gateway
- [ ] Implement subscription plans (Free, Monthly, Quarterly, Annual)
- [ ] Build feature gating system
- [ ] Create subscription management endpoints
- [ ] Implement webhook handlers for payment events
- [ ] Add invoice generation

**Frontend Tasks:**
- [ ] Create pricing page
- [ ] Build payment checkout flow
- [ ] Create subscription management page
- [ ] Add payment success/failure pages
- [ ] Implement feature locks for free users
- [ ] Display subscription status in profile

**Subscription Tiers:**
```
Free: 10 questions/day, basic analytics
Monthly (₦2,500): Unlimited questions, mock exams, AI tutor
Quarterly (₦6,000): Monthly + priority support
Annual (₦20,000): Quarterly + offline mode + premium content
```

**API Endpoints:**
```
GET  /api/subscriptions/plans/
POST /api/subscriptions/subscribe/
POST /api/subscriptions/cancel/
GET  /api/subscriptions/status/
POST /api/webhooks/paystack/
```

**Deliverables**: Working payment and subscription system

---

### TODO #12: Institutional Licensing
**Status**: 🔴 Not Started  
**Priority**: MEDIUM  
**Estimated Time**: 3-4 days

**Features:**
- [ ] School admin portal
- [ ] Bulk student account creation
- [ ] Institution dashboard with aggregate analytics
- [ ] Custom branding options
- [ ] Student management interface

**Deliverables**: B2B offering for schools

---

## 🎨 PHASE 4: POLISH & OPTIMIZATION (Weeks 11-12)

### TODO #13: Performance Optimization
**Status**: 🔴 Not Started  
**Priority**: HIGH  
**Estimated Time**: 3-4 days

**Backend:**
- [ ] Implement database query optimization
- [ ] Add database indexing
- [ ] Set up Redis caching strategy
- [ ] Optimize AI API calls (batch processing)
- [ ] Implement API rate limiting
- [ ] Add response compression
- [ ] Set up database read replicas (if needed)

**Frontend:**
- [ ] Implement code splitting
- [ ] Add lazy loading for routes
- [ ] Optimize images (Next.js Image component)
- [ ] Implement service worker for offline support
- [ ] Add skeleton loaders
- [ ] Optimize bundle size
- [ ] Set up CDN for static assets

**Deliverables**: Fast, optimized application

---

### TODO #14: Mobile Responsiveness & PWA
**Status**: 🔴 Not Started  
**Priority**: HIGH  
**Estimated Time**: 3 days

**Tasks:**
- [ ] Ensure full mobile responsiveness
- [ ] Configure PWA manifest
- [ ] Implement offline mode
- [ ] Add app install prompt
- [ ] Test on various devices
- [ ] Optimize for low-bandwidth

**Deliverables**: Installable mobile-first PWA

---

### TODO #15: Testing & Quality Assurance
**Status**: 🔴 Not Started  
**Priority**: HIGH  
**Estimated Time**: 4-5 days

**Backend Testing:**
- [ ] Write unit tests (pytest)
- [ ] Write integration tests
- [ ] Test AI integrations
- [ ] Test payment flows
- [ ] Load testing with Locust

**Frontend Testing:**
- [ ] Unit tests (Jest)
- [ ] Component tests (React Testing Library)
- [ ] E2E tests (Playwright/Cypress)
- [ ] Accessibility testing
- [ ] Cross-browser testing

**Target Coverage:** 80%+

**Deliverables**: Comprehensive test suite

---

### TODO #16: Documentation
**Status**: 🔴 Not Started  
**Priority**: MEDIUM  
**Estimated Time**: 2-3 days

**Docs to Create:**
- [ ] API documentation (Swagger/ReDoc)
- [ ] User guide
- [ ] Teacher/school admin guide
- [ ] Developer setup guide
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] FAQ section

**Deliverables**: Complete documentation

---

## 🚢 PHASE 5: DEPLOYMENT & LAUNCH (Weeks 13-14)

### TODO #17: Production Setup
**Status**: 🔴 Not Started  
**Priority**: CRITICAL  
**Estimated Time**: 3-4 days

**Tasks:**
- [ ] Set up production database (PostgreSQL on Railway/Supabase)
- [ ] Configure production Redis
- [ ] Set up production environment variables
- [ ] Configure CORS and security headers
- [ ] Set up SSL certificates
- [ ] Configure CDN (Cloudflare)
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging
- [ ] Set up automated backups

**Deliverables**: Production-ready infrastructure

---

### TODO #18: Deployment
**Status**: 🔴 Not Started  
**Priority**: CRITICAL  
**Estimated Time**: 2-3 days

**Backend Deployment:**
- [ ] Deploy to Railway/Render/AWS
- [ ] Configure environment variables
- [ ] Run migrations
- [ ] Seed production data
- [ ] Set up Celery workers
- [ ] Configure task queues

**Frontend Deployment:**
- [ ] Deploy to Vercel/Netlify
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Test production build

**Deliverables**: Live application

---

### TODO #19: Monitoring & Analytics
**Status**: 🔴 Not Started  
**Priority**: HIGH  
**Estimated Time**: 2 days

**Tasks:**
- [ ] Set up Google Analytics
- [ ] Configure Sentry error tracking
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Add performance monitoring
- [ ] Set up user analytics dashboards
- [ ] Configure alert systems

**Deliverables**: Complete monitoring setup

---

### TODO #20: Beta Launch
**Status**: 🔴 Not Started  
**Priority**: HIGH  
**Estimated Time**: 1 week

**Pre-Launch:**
- [ ] Recruit 50-100 beta testers
- [ ] Create feedback collection system
- [ ] Set up support channels (email, WhatsApp)
- [ ] Prepare marketing materials
- [ ] Create social media accounts

**Launch Tasks:**
- [ ] Soft launch to beta users
- [ ] Collect and analyze feedback
- [ ] Fix critical bugs
- [ ] Iterate based on user feedback
- [ ] Prepare for public launch

**Deliverables**: Beta version with real users

---

## 🔮 PHASE 6: POST-LAUNCH (Ongoing)

### TODO #21: Feature Expansion
**Status**: 🔴 Not Started  
**Priority**: MEDIUM

**Features to Add:**
- [ ] Mobile app (React Native)
- [ ] WhatsApp bot integration
- [ ] Voice-based learning
- [ ] Video explanations (AI-generated)
- [ ] Peer study groups
- [ ] Parent dashboard
- [ ] Teacher collaboration tools
- [ ] More exam types (WAEC, NECO, GCE)
- [ ] More subjects

---

### TODO #22: Marketing & Growth
**Status**: 🔴 Not Started  
**Priority**: HIGH

**Activities:**
- [ ] Content marketing (blog, YouTube)
- [ ] Social media campaigns
- [ ] School partnerships
- [ ] Influencer collaborations
- [ ] SEO optimization
- [ ] Referral program
- [ ] Student ambassador program

---

## 📊 Progress Tracking

### Overall Progress: 0% Complete

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Foundation | 🔴 Not Started | 0/6 |
| Phase 2: Core Features | 🔴 Not Started | 0/4 |
| Phase 3: Monetization | 🔴 Not Started | 0/2 |
| Phase 4: Polish | 🔴 Not Started | 0/4 |
| Phase 5: Deployment | 🔴 Not Started | 0/4 |
| Phase 6: Post-Launch | 🔴 Not Started | 0/2 |

**Legend:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- 🔵 Blocked

---

## 🎯 Critical Path Items

**Must Have for MVP (Beta Launch):**
1. ✅ TODO #1 - Project Setup
2. ✅ TODO #2 - Authentication
3. ✅ TODO #3 - Subject Setup
4. ✅ TODO #4 - AI Questions
5. ✅ TODO #5 - Progress Tracking
6. ✅ TODO #7 - Mock Exams

**Should Have:**
- TODO #6 - Study Plans
- TODO #8 - AI Tutor
- TODO #11 - Subscriptions

**Nice to Have:**
- TODO #10 - Gamification
- TODO #12 - School Portal

---

## 💡 How to Use This File

**When working with AI assistants:**
```
"Let's work on TODO #4 - AI Question Generation"
"Start Phase 1, Item 2 (Authentication)"
"Review the checklist for TODO #7"
"What are the deliverables for TODO #11?"
```

**For team collaboration:**
- Assign TODO items to team members
- Update status indicators as you progress
- Check off completed sub-tasks
- Add notes or blockers inline

**For project management:**
- Use as sprint planning reference
- Track overall project completion
- Identify dependencies
- Estimate timeline

---

**Last Updated**: February 9, 2026
**Next Review**: After completing Phase 1