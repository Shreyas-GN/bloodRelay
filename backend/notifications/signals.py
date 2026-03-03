from django.db.models.signals import post_save
from django.dispatch import receiver
from blood_requests.models import BloodRequest
from .models import Notification
from matching.services import get_matching_donors

@receiver(post_save, sender=BloodRequest)
def notify_matching_donors(sender, instance, created, **kwargs):
    """
    When a BloodRequest is created or updated to SEARCHING status,
    notify all matching donors.
    """
    # Only notify when status becomes SEARCHING_FOR_DONORS
    if instance.status == BloodRequest.RequestStatus.SEARCHING:
        # Get matching donors
        matching_donors = get_matching_donors(instance, max_distance_km=50)
        
        # Create notifications for each matching donor
        notifications_to_create = []
        for donor in matching_donors:
            # Check if notification already exists to avoid duplicates
            existing = Notification.objects.filter(
                recipient=donor,
                related_request=instance,
                type=Notification.NotificationType.DONOR_NEEDED
            ).exists()
            
            if not existing:
                notification = Notification(
                    recipient=donor,
                    title=f"🩸 Urgent: {instance.blood_group} Blood Needed",
                    message=f"A patient at {instance.hospital_name} urgently needs {instance.blood_group} blood. "
                            f"You are a matching donor nearby. Please respond if you can help.",
                    type=Notification.NotificationType.DONOR_NEEDED,
                    related_request=instance
                )
                notifications_to_create.append(notification)
        
        # Bulk create notifications for efficiency
        if notifications_to_create:
            Notification.objects.bulk_create(notifications_to_create)
            print(f"✓ Created {len(notifications_to_create)} notifications for request #{instance.id}")

@receiver(post_save, sender=BloodRequest)
def notify_request_accepted(sender, instance, created, **kwargs):
    """
    When a donor accepts a request, notify the requester.
    """
    if instance.status == BloodRequest.RequestStatus.ACCEPTED and instance.assigned_donor:
        # Notify the requester
        Notification.objects.get_or_create(
            recipient=instance.requester,
            related_request=instance,
            type=Notification.NotificationType.REQUEST_ACCEPTED,
            defaults={
                'title': '✅ Donor Found!',
                'message': f"Great news! A donor has accepted your request for {instance.blood_group} blood at {instance.hospital_name}. "
                          f"Please contact them at {instance.assigned_donor.phone_number}."
            }
        )

@receiver(post_save, sender=BloodRequest)
def notify_request_completed(sender, instance, created, **kwargs):
    """
    When a request is completed, notify the assigned donor.
    """
    if instance.status == BloodRequest.RequestStatus.COMPLETED and instance.assigned_donor:
        # Notify the donor
        Notification.objects.get_or_create(
            recipient=instance.assigned_donor,
            related_request=instance,
            type=Notification.NotificationType.REQUEST_COMPLETED,
            defaults={
                'title': '🎉 Thank You!',
                'message': f"The blood request at {instance.hospital_name} has been completed. "
                          f"Thank you for your life-saving donation!"
            }
        )
