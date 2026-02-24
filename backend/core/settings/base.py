import dj_database_url
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ============================================================================
# CORE SETTINGS
# ============================================================================

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-dev-key-change-in-production")
DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# ============================================================================
# INSTALLED APPS
# ============================================================================

INSTALLED_APPS = [
    "daphne",  # ASGI server for WebSockets
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party apps
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "channels",
    # Local apps
    "apps.accounts",
    "apps.ai_tutor",
    "apps.analytics",
    "apps.content",
    "apps.exams",
    "apps.gamification",
    "apps.institutions",
    "apps.questions",
    "apps.study_plans",
    "apps.subscriptions",
    "apps.study_tools",
    "apps.quiz",
    "apps.notifications",
    "django_q",
]

# ============================================================================
# MIDDLEWARE
# ============================================================================

MIDDLEWARE = [
    "django.middleware.gzip.GZipMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ============================================================================
# URL CONFIGURATION
# ============================================================================

ROOT_URLCONF = "core.urls"

# ============================================================================
# ASGI CONFIGURATION
# ============================================================================

ASGI_APPLICATION = "core.asgi.application"
WSGI_APPLICATION = "core.wsgi.application"

# ============================================================================
# DATABASE
# ============================================================================

DATABASES = {
    "default": dj_database_url.parse(
        os.getenv("DATABASE_URL", "sqlite:///db.sqlite3")
    )
}

# Apply conditional Database Concurrency optimizations
_db_engine = DATABASES["default"].get("ENGINE", "")
if "sqlite" in _db_engine:
    # SQLite PRAGMAs for high concurrency (WAL mode, busy timeout)
    DATABASES["default"]["OPTIONS"] = {
        "timeout": 20,
        "init_command": "PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL; PRAGMA busy_timeout=5000;"
    }
elif "postgresql" in _db_engine:
    # Postgres persistent connections
    DATABASES["default"]["CONN_MAX_AGE"] = int(os.getenv("CONN_MAX_AGE", 60))
    DATABASES["default"]["CONN_HEALTH_CHECKS"] = True

# ============================================================================
# PASSWORD VALIDATION
# ============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# ============================================================================
# AUTHENTICATION
# ============================================================================

AUTH_USER_MODEL = "accounts.User"

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

# ============================================================================
# REST FRAMEWORK SETTINGS
# ============================================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/day",
        "user": "5000/day",
        "ai_generation": "50/day",
    },
}

# ============================================================================
# JWT SETTINGS
# ============================================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=7),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "JTI_CLAIM": "jti",
    "TOKEN_TYPE_CLAIM": "token_type",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
}

# ============================================================================
# CORS SETTINGS
# ============================================================================

CORS_ALLOWED_ORIGINS = [
    origin.rstrip("/") for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000"
    ).split(",") if origin
]

CORS_ALLOW_CREDENTIALS = True

# ============================================================================
# FRONTEND CONFIGURATION
# ============================================================================

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

# ============================================================================
# INTERNATIONALIZATION
# ============================================================================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ============================================================================
# TEMPLATES
# ============================================================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ============================================================================
# STATIC FILES
# ============================================================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "static"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# ============================================================================
# DEFAULT PRIMARY KEY
# ============================================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ============================================================================
# EMAIL SETTINGS
# ============================================================================

EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "utils.email.ResendEmailBackend"
)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")

# SMTP SETTINGS (No longer used by default, but kept for reference)
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.googlemail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "False") == "True"
# Fallback: If SSL is not used, default TLS to True unless explicitly disabled
if not EMAIL_USE_SSL:
    EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
else:
    EMAIL_USE_TLS = False

EMAIL_TIMEOUT = int(os.getenv("EMAIL_TIMEOUT", 15))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "Acme <onboarding@resend.dev>")

# ============================================================================
# GOOGLE OAUTH SETTINGS
# ============================================================================

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")



# ============================================================================
# AI CONFIGURATION
# ============================================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", None)
GROQ_TIMEOUT = int(os.getenv("GROQ_TIMEOUT", 60))

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
HUGGINGFACE_MODEL = os.getenv("HUGGINGFACE_MODEL", "")
HUGGINGFACE_BASE_URL = os.getenv("HUGGINGFACE_BASE_URL", "https://api.huggingface.co/v1")
HUGGINGFACE_TIMEOUT = int(os.getenv("HUGGINGFACE_TIMEOUT", 60))

COHERE_API_KEY = os.getenv("COHERE_API_KEY", "")
COHERE_MODEL = os.getenv("COHERE_MODEL", "")
COHERE_BASE_URL = os.getenv("COHERE_BASE_URL", "https://api.cohere.com/v1")
COHERE_TIMEOUT = int(os.getenv("COHERE_TIMEOUT", 60))

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "")
MISTRAL_BASE_URL = os.getenv("MISTRAL_BASE_URL", "https://api.mistral.ai/v1")
MISTRAL_TIMEOUT = int(os.getenv("MISTRAL_TIMEOUT", 60))

ALOC_ACCESS_TOKEN = os.getenv("ALOC_ACCESS_TOKEN", "")
ALOC_ACCESS_TOKEN_SECONDARY = os.getenv("ALOC_ACCESS_TOKEN_SECONDARY", "")
ALOC_BASE_URL = os.getenv("ALOC_BASE_URL", "https://questions.aloc.com.ng/api/v2")
ALOC_TIMEOUT = int(os.getenv("ALOC_TIMEOUT", 60))


# ============================================================================
# PAYSTACK SETTINGS
# ============================================================================

PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
PAYSTACK_PUBLIC_KEY = os.getenv("PAYSTACK_PUBLIC_KEY", "")
PAYSTACK_BASE_URL = os.getenv("PAYSTACK_BASE_URL", "https://api.paystack.co")
PAYSTACK_TIMEOUT = int(os.getenv("PAYSTACK_TIMEOUT", 60))


# ============================================================================
# DJANGO-Q2 SETTINGS (Background Tasks)
# ============================================================================

Q_CLUSTER = {
    'name': 'prepgenius_cluster',
    'workers': 2,
    'recycle': 500,
    'timeout': 60,
    'compress': True,
    'save_limit': 250,
    'queue_limit': 500,
    'cpu_affinity': 1,
    'label': 'Django Q',
    'orm': 'default' # Uses SQLite/Postgres as the message broker (no Redis required)
}

# ============================================================================
# REDIS SETTINGS & CACHES
# ============================================================================

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
    }
}

# ============================================================================
# LOGGING
# ============================================================================

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}

# ============================================================================
# CHANNELS CONFIGURATION (WebSocket Support)
# ============================================================================

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [REDIS_URL],
        },
    },
}

# ============================================================================
# CHAT RATE LIMITS
# ============================================================================

CHAT_RATE_LIMITS = {
    "free": {
        "messages_per_hour": 50
    },
    "premium": {
        "messages_per_hour": None  # Unlimited
    }
}