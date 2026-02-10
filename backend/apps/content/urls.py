from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('countries', CountryViewSet)
router.register('exam-boards', ExamBoardViewSet)
router.register('exam-types', ExamTypeViewSet)
router.register('subjects', SubjectViewSet)
router.register('topics', TopicViewSet)
router.register('subtopics', SubtopicViewSet)

urlpatterns = router.urls
