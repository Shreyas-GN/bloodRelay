from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='settings')
    
    # Availability Controls
    auto_disable_on_accept = models.BooleanField(default=True)
    auto_disable_after_donation = models.BooleanField(default=True)
    notification_distance_km = models.IntegerField(
        choices=[(3, '3 km'), (5, '5 km'), (10, '10 km')],
        default=5
    )
    emergency_types = models.CharField(
        max_length=20,
        choices=[('IMMEDIATE', 'Immediate Only'), ('ALL', 'All Urgent')],
        default='ALL'
    )
    
    # Notification Settings
    push_notifications = models.BooleanField(default=True)
    status_updates = models.BooleanField(default=True)
    
    # Privacy & Safety
    show_phone_number = models.BooleanField(default=False)  # Only after accept
    share_location = models.BooleanField(default=False)     # Only after accept
    
    # Accessibility
    language = models.CharField(max_length=10, default='en')
    text_size = models.CharField(
        max_length=10,
        choices=[('NORMAL', 'Normal'), ('LARGE', 'Large')],
        default='NORMAL'
    )
    
    # Donor Specific
    is_paused = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Settings for {self.user.username}"

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_settings(sender, instance, created, **kwargs):
    if created:
        UserSettings.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_settings(sender, instance, **kwargs):
    if hasattr(instance, 'settings'):
        instance.settings.save()
    else:
         UserSettings.objects.create(user=instance)
