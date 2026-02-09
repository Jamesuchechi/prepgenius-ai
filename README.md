# PrepGenius AI

> AI-powered study and exam preparation platform for Nigerian students

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
## 📖 Overview

PrepGenius AI is an intelligent learning platform that helps students prepare effectively for standardized exams (JAMB, WAEC, NECO, GCE, NABTEB) through personalized study plans, adaptive practice questions, and AI-powered feedback.

### Key Features

- 🎯 **Personalized Study Plans** - AI-generated schedules that adapt to your performance
- 📝 **Smart Practice Questions** - Difficulty-adaptive questions with detailed explanations
- 🎓 **Exam Simulation** - Timed mock exams with auto-grading
- 📊 **Progress Analytics** - Track mastery levels, weak areas, and performance trends
- 💬 **AI Study Assistant** - Chat-based tutor for instant help
- 🏆 **Gamification** - Streaks, badges, and leaderboards to stay motivated
- 📱 **Mobile-First Design** - Works seamlessly on low-bandwidth connections

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/prepgenius-ai.git
cd prepgenius-ai

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start backend server
python manage.py runserver

# Frontend setup (new terminal)
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration

# Start frontend server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Project Structure

```
prepgenius-ai/
├── backend/                 # Django backend
│   ├── apps/
│   │   ├── accounts/       # User authentication & profiles
│   │   ├── questions/      # Question generation & management
│   │   ├── exams/          # Mock exams & submissions
│   │   ├── analytics/      # Progress tracking & insights
│   │   ├── ai_tutor/       # Chat-based AI assistant
│   │   └── content/        # Study materials & syllabus
│   ├── core/               # Core settings & utilities
│   ├── api/                # API endpoints
│   └── manage.py
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities & API clients
│   │   ├── hooks/        # Custom React hooks
│   │   └── styles/       # Global styles
│   └── public/           # Static assets
│
├── ai_services/           # AI model integration layer
│   ├── openai_client.py
│   ├── gemini_client.py
│   ├── mistral_client.py
│   └── router.py         # Smart AI model routing
│
├── docs/                 # Documentation
│   ├── api/             # API documentation
│   ├── architecture/    # System design docs
│   └── deployment/      # Deployment guides
│
├── scripts/             # Utility scripts
│   ├── seed_data.py    # Database seeding
│   └── generate_questions.py
│
├── docker/              # Docker configurations
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
└── tests/              # Test suites
    ├── backend/
    └── frontend/
```

## 🔧 Technology Stack

### Backend
- **Framework**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL (primary), Redis (caching)
- **Task Queue**: Celery + Redis
- **WebSockets**: Django Channels
- **AI Integration**: OpenAI, Google Gemini, Mistral APIs

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Hosting**: TBD (Vercel/Railway/AWS)
- **CDN**: Cloudflare
- **Storage**: AWS S3 / Cloudflare R2
- **Monitoring**: Sentry

## 🔑 Environment Variables

### Backend (.env)
```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prepgenius

# Redis
REDIS_URL=redis://localhost:6379/0

# AI APIs
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
MISTRAL_API_KEY=...

# Payment
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_ENVIRONMENT=development
```

## 📚 API Documentation

API documentation is available at:
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

See [deployment guide](docs/deployment/README.md) for detailed instructions.

Quick deploy with Docker:
```bash
docker-compose up -d
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Your Name** - Lead Developer - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- OpenAI, Google, and Mistral for AI APIs
- Nigerian education system stakeholders
- Beta testers and early users

## 📧 Contact

- Website: [prepgenius.ai](https://prepgenius.ai)
- Email: support@prepgenius.ai
- Twitter: [@prepgeniusai](https://twitter.com/prepgeniusai)

## 🗺️ Roadmap

- [x] Project setup and architecture
- [ ] Core authentication system
- [ ] AI question generation (Phase 1)
- [ ] Basic progress tracking
- [ ] Mock exam functionality
- [ ] Payment integration
- [ ] Mobile app (Android/iOS)
- [ ] WhatsApp bot integration
- [ ] School partnership portal

---

**Built with ❤️ for Nigerian students**