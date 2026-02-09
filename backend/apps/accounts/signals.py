from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import User


@receiver(post_save, sender=User)
def update_last_login_on_save(sender, instance, created, **kwargs):
    """
    Signal to handle any post-save logic for User model.
    Can be extended for additional functionality.
    """
    if created:
        # Perform any initialization for newly created users
        pass