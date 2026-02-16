from django.apps import AppConfig

class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.analytics'
    
    def ready(self):
        """Register signal handlers when app is ready."""
        import apps.analytics.signals  # noqa
