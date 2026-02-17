from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/accounts/', include('apps.accounts.urls', namespace='accounts')),
    path('api/content/', include('apps.content.urls')),
    path('api/questions/', include('apps.questions.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/', include('apps.study_plans.urls')),
    path('api/exams/', include('apps.exams.urls')),
    path('api/chat/', include('apps.ai_tutor.urls')),
    path('api/study-tools/', include('apps.study_tools.urls')),
    path('api/quiz/', include('apps.quiz.urls')),
    path('api/v1/gamification/', include('apps.gamification.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/subscriptions/', include('apps.subscriptions.urls', namespace='subscriptions')),
    path('api/institutions/', include('apps.institutions.urls', namespace='institutions')),
    path('api/webhooks/', include('apps.subscriptions.webhooks_urls', namespace='webhooks')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
