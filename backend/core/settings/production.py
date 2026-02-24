from .base import *
import os

# ============================================================================
# PRODUCTION CORE SETTINGS
# ============================================================================

DEBUG = os.getenv("DEBUG", "False") == "True"

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")
if not ALLOWED_HOSTS or ALLOWED_HOSTS == [""]:
    # Fallback to local if not set, but warn in logs
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Automatic Detection of Render External Hostname
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# ============================================================================
# CSRF SETTINGS
# ============================================================================

# Ensure CSRF trusted origins include the CORS origins
CSRF_TRUSTED_ORIGINS = [origin for origin in CORS_ALLOWED_ORIGINS if origin]

# Also trust the backend domain itself for CSRF if on Render
if RENDER_EXTERNAL_HOSTNAME:
    CSRF_TRUSTED_ORIGINS.append(f"https://{RENDER_EXTERNAL_HOSTNAME}")

# ============================================================================
# SECURITY SETTINGS
# ============================================================================

# Security settings for production
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "True") == "True"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# ============================================================================
# DATABASE SETTINGS
# ============================================================================

# Ensure DATABASE_URL is being used from build.sh or Render env
# base.py already handles dj_database_url.parse(os.getenv("DATABASE_URL"))

# ============================================================================
# STATIC FILES (WHITENOISE)
# ============================================================================

# WhiteNoise settings for production storage
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# ============================================================================
# LOGGING (PRODUCTION)
# ============================================================================

LOGGING["root"]["level"] = "ERROR"
LOGGING["handlers"]["console"]["level"] = "ERROR"
