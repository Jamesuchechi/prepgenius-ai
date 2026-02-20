# PrepGenius AI - Deployment Guide

This document outlines the step-by-by guide to deploying the PrepGenius AI application into a production environment. The application is composed of a Next.js frontend and a Django REST Framework backend with Celery (Django-Q) and Redis for background processing.

---

## 🏗️ 1. Frontend Deployment (Vercel or Netlify)

Vercel is the creator of Next.js and provides the smoothest deployment experience.

### Vercel Deployment Steps:
1. Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2. Log into [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your `prepgenius-ai` repository.
4. Set the **Framework Preset** to `Next.js`.
5. Set the **Root Directory** to `frontend`.
6. Configure the Build Settings (should auto-detect):
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`
7. Add the required Environment Variables in the Vercel dashboard:
   ```env
   # Ensure this points to your deployed backend URL (HTTPS)
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
   ```
8. Click **Deploy**. Vercel will build and assign you a production URL.

---

## 🛠️ 2. Backend Deployment (Render or Koyeb)

The backend handles the API, database migrations, WebSocket connections (ASGI), and background workers.

### Prerequisites (Database & Redis)
You will need:
1. A **Managed PostgreSQL Database** (Render and Koyeb both offer managed Postgres).
2. A **Managed Redis Instance** (Required for caching, WebSockets, and background tasks). Render provides Redis instances.

### Render Web Service Deployment:
1. Create a new **Web Service** on Render connected to your repository.
2. Under "Root Directory", enter `backend`.
3. Set the Environment to `Python`.
4. Configure Build and Start commands:
   - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command (ASGI for WebSockets):** `daphne -b 0.0.0.0 -p $PORT core.asgi:application` OR `uvicorn core.asgi:application --host 0.0.0.0 --port $PORT`
5. Configure the essential Environment Variables for Production:
   ```env
   # Core
   DEBUG=False
   SECRET_KEY=your_secure_random_string_here
   ALLOWED_HOSTS=your-backend-url.onrender.com,your-frontend-url.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   FRONTEND_URL=https://your-frontend-url.vercel.app
   
   # Databases
   DATABASE_URL=postgres://user:password@hostname:5432/dbname
   REDIS_URL=rediss://user:password@hostname:6379/
   
   # Email
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@example.com
   EMAIL_HOST_PASSWORD=your_app_password
   DEFAULT_FROM_EMAIL=your-email@example.com
   
   # AI Services
   GROQ_API_KEY=your_key_here
   HUGGINGFACE_API_KEY=your_key_here
   COHERE_API_KEY=your_key_here
   MISTRAL_API_KEY=your_key_here
   
   # External Services
   ALOC_ACCESS_TOKEN=your_token
   PAYSTACK_SECRET_KEY=your_secret_key
   PAYSTACK_PUBLIC_KEY=your_public_key
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   ```

### 3. Background Worker Deployment (Django-Q)
Because PrepGenius delegates tasks via Django-Q (background clustering), you must spin up a separate Background Worker associated with the backend.

1. Create a **Background Worker** project on Render (using the same repository and `backend` root dir).
2. Use the following commands:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python manage.py qcluster`
3. Duplicate the EXACT same environment variables used in the Web Service (especially `DATABASE_URL` and `REDIS_URL`).

---

## 🗄️ 4. Post-Deployment Commands (Migrations & Seeding)

Once your Web Service is live, you must run migrations to set up the Postgres tables. On platforms like Render, you can use the interactive "Shell" tab to execute CLI commands.

1. **Run Migrations:**
   ```bash
   python manage.py migrate
   ```

2. **Create Superuser Admin:**
   ```bash
   python manage.py createsuperuser
   ```
   *(Follow the prompt to set up an email and password to access the `/admin/` panel).*

3. **Seed Initial Data:**
   If you have `.json` fixtures or python scripts for seeding (e.g., standard exam types, subjects, and topics), run them now:
   ```bash
   # Example if using fixtures
   python manage.py loaddata exam_types.json subjects.json
   
   # Example if using custom scripts
   python manage.py shell < scripts/seed_database.py
   ```

---

## 🚀 5. Final Checklist
- [ ] Ensure the Vercel frontend `NEXT_PUBLIC_API_URL` points exactly to the deployed Render backend URL.
- [ ] Ensure the Render backend `CORS_ALLOWED_ORIGINS` strictly contains the Vercel frontend domain.
- [ ] Confirm the database has run all migrations successfully.
- [ ] Verify background workers are active by checking the logs of the `qcluster` service.
- [ ] Submit a contact form on production to verify SMTP/Email dispatch works. 

Happy Deploying! 🎉
