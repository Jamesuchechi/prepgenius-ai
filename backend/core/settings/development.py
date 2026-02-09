from .base import *

# Development-specific settings

# Enable debug mode
DEBUG = True

# Allow all hosts in development
ALLOWED_HOSTS = ["*"]

# SQLite for development
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Allow all CORS origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Email configuration for development (console backend)
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Logging configuration
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

# Celery configuration for development
CELERY_TASK_ALWAYS_EAGER = True  # Execute tasks synchronously in development
