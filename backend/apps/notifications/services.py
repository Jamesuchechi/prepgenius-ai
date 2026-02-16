from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification
from .serializers import NotificationSerializer

class NotificationService:
    @staticmethod
    def create_notification(user, title, message, notification_type='system'):
        """
        Creates a notification in DB and broadcasts it via WebSocket.
        """
        # Create in DB
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type
        )
        
        # Serialize for WebSocket
        serializer = NotificationSerializer(notification)
        data = serializer.data
        
        # Broadcast via Channels
        channel_layer = get_channel_layer()
        group_name = f"user_{user.id}_notifications"
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_notification",
                "notification": data
            }
        )
        
        return notification
