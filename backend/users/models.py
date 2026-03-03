from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class BloodGroup(models.TextChoices):
        A_POS = 'A+', 'A+'
        A_NEG = 'A-', 'A-'
        B_POS = 'B+', 'B+'
        B_NEG = 'B-', 'B-'
        AB_POS = 'AB+', 'AB+'
        AB_NEG = 'AB-', 'AB-'
        O_POS = 'O+', 'O+'
        O_NEG = 'O-', 'O-'

    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=False)
    blood_group = models.CharField(max_length=3, choices=BloodGroup.choices, blank=True, null=True)
    
    # Location fields
    city = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    is_available_donor = models.BooleanField(default=False)
    last_donation_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.username

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    
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

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_settings(sender, instance, created, **kwargs):
    if created:
        UserSettings.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_settings(sender, instance, **kwargs):
    if hasattr(instance, 'settings'):
        instance.settings.save()
    else:
         UserSettings.objects.create(user=instance)
