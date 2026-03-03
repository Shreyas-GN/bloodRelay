from rest_framework import serializers
from .models import Notification
from blood_requests.serializers import BloodRequestSerializer

class NotificationSerializer(serializers.ModelSerializer):
    related_request = BloodRequestSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'type',
            'related_request',
            'is_read',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class NotificationMarkReadSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of notification IDs to mark as read. If empty, marks all as read."
    )
