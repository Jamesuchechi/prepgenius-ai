from django.apps import AppConfig

class StudyToolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.study_tools'

    def ready(self):
        import apps.study_tools.signals
