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
2. Under "Root Directory", enter **`backend`**.
3. Set the Environment to `Python`.
4. Configure Build and Start commands:
   - **Build Command:** `./build.sh`
   - **Start Command:** `./start.sh`

> [!NOTE]
> Because you set the **Root Directory** to `backend`, Render will run these commands from inside that folder. Since both `build.sh` and `start.sh` are located inside `backend/`, the `./` prefix is exactly what you need.
5. Configure the essential Environment Variables for Production:
   ```env
   # Core
   PYTHON_VERSION=3.12.3  # CRITICAL: Forces Render to use a stable version
   DEBUG=False
   SECRET_KEY=your_secure_random_string_here
   ALLOWED_HOSTS=your-backend-url.onrender.com,your-frontend-url.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   FRONTEND_URL=https://your-frontend-url.vercel.app
   
   # Databases
   DATABASE_URL=postgres://user:password@hostname:5432/dbname
   REDIS_URL=rediss://user:password@hostname:6379/
   
   # Superuser (Optional: Defaults are already set in script)
   # DJANGO_SUPERUSER_USERNAME=jamesuchi
   # DJANGO_SUPERUSER_EMAIL=jamesuchechi27@gmail.com
   # DJANGO_SUPERUSER_PASSWORD=admin
   
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

---

## 🗄️ 3. Post-Deployment Commands (Migrations & Seeding)

On platforms like Render free tier where shell access is restricted, the automation scripts I've created handle everything during the build process.

**The `build.sh` script automatically performs:**
1. Database Migrations (`python manage.py migrate`)
2. Static File Collection (`python manage.py collectstatic`)
3. Data Seeding:
   - `load_countries`
   - `load_nigeria_data`
   - `seed_standardized_subjects`
   - `load_math_topics`
   - `seed_badges`
   - `seed_subscription_plans`
4. Automated Admin Creation (Default: `jamesuchi`/`jamesuchechi27@gmail.com`/`admin`)

**Note:** The `start.sh` script starts both the **Daphne server** and the **Django-Q worker** in a single process to save resources on free tiers.

---

## 🚀 4. Final Checklist
- [ ] Ensure the Vercel frontend `NEXT_PUBLIC_API_URL` points exactly to the deployed Render backend URL.
- [ ] Ensure the Render backend `CORS_ALLOWED_ORIGINS` strictly contains the Vercel frontend domain.
- [ ] Confirm the database has run all migrations successfully.
- [ ] Verify background workers are active by checking the logs of the `qcluster` service.
- [ ] Submit a contact form on production to verify SMTP/Email dispatch works. 

Happy Deploying! 🎉
