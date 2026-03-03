from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer, NotificationMarkReadSerializer

class NotificationListView(generics.ListAPIView):
    """
    List all notifications for the authenticated user.
    Query params:
    - unread_only: true/false (default: false)
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        
        # Filter by unread if requested
        unread_only = self.request.query_params.get('unread_only', 'false').lower() == 'true'
        if unread_only:
            queryset = queryset.filter(is_read=False)
        
        return queryset

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notifications_read(request):
    """
    Mark notifications as read.
    Body: { "notification_ids": [1, 2, 3] } or empty to mark all as read
    """
    serializer = NotificationMarkReadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    notification_ids = serializer.validated_data.get('notification_ids', [])
    
    # Get user's notifications
    queryset = Notification.objects.filter(recipient=request.user, is_read=False)
    
    # Filter by specific IDs if provided
    if notification_ids:
        queryset = queryset.filter(id__in=notification_ids)
    
    # Mark as read
    updated_count = queryset.update(is_read=True)
    
    return Response({
        'message': f'{updated_count} notification(s) marked as read',
        'count': updated_count
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def unread_count(request):
    """
    Get count of unread notifications for the authenticated user.
    """
    count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).count()
    
    return Response({'unread_count': count})
