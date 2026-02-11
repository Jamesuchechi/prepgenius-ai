from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls', namespace='accounts')),
    path('api/content/', include('apps.content.urls')),
    path('api/questions/', include('apps.questions.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/', include('apps.study_plans.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
