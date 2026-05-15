from django.db import models
import uuid

class DonorProfile(models.Model):
    # Clerk ID is used as the primary key
    id = models.CharField(max_length=255, primary_key=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    blood_group = models.CharField(max_length=10)
    is_donor = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'profiles'
        managed = False # Since it exists in Supabase

    def __str__(self):
        return f"{self.full_name} ({self.blood_group})"

class BloodRequest(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(DonorProfile, on_delete=models.CASCADE, related_name='blood_requests')
    blood_group = models.CharField(max_length=10)
    units_required = models.IntegerField(default=1)
    hospital_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    notified_count = models.IntegerField(default=0)
    escalation_phase = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'requests'
        managed = False # Since it exists in Supabase

    def __str__(self):
        return f"{self.blood_group} request at {self.hospital_name}"
