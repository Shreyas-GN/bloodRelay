from django.db import models
from django.conf import settings

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        DONOR_MATCH = 'DONOR_MATCH', 'Donor Match Found'
        REQUEST_ACCEPTED = 'REQUEST_ACCEPTED', 'Request Accepted'
        REQUEST_COMPLETED = 'REQUEST_COMPLETED', 'Request Completed'
        REQUEST_CANCELLED = 'REQUEST_CANCELLED', 'Request Cancelled'
        DONOR_NEEDED = 'DONOR_NEEDED', 'Urgent: Donor Needed'
    
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(
        max_length=50,
        choices=NotificationType.choices,
        default=NotificationType.DONOR_MATCH
    )
    related_request = models.ForeignKey(
        'blood_requests.BloodRequest',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.type} for {self.recipient.username} - {self.title}"
