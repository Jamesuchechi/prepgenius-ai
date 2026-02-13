from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.study_tools.models import Document
from .services.document_processor import DocumentProcessor
import threading

@receiver(post_save, sender=Document)
def trigger_document_processing(sender, instance, created, **kwargs):
    if created:
        # Run processing in a separate thread to avoid blocking the request
        thread = threading.Thread(
            target=DocumentProcessor.process_document,
            args=(instance.id,)
        )
        thread.daemon = True
        thread.start()
