from django.db import models
import uuid
import os

IS_LOCAL_SQLITE = not os.getenv('DATABASE_URL') or 'sqlite' in os.getenv('DATABASE_URL', '')


class DonorProfile(models.Model):
    id                  = models.CharField(max_length=255, primary_key=True)
    full_name           = models.CharField(max_length=255)
    phone               = models.CharField(max_length=20, blank=True, null=True)
    blood_group         = models.CharField(max_length=10, blank=True, null=True)
    is_donor            = models.BooleanField(default=False)
    is_available_donor  = models.BooleanField(default=False)
    city                = models.CharField(max_length=255, blank=True, null=True)
    profile_completed   = models.BooleanField(default=False)
    # location stored as WKT text; PostGIS geography column accepts this on write
    location            = models.TextField(blank=True, null=True)
    latitude            = models.FloatField(blank=True, null=True)
    longitude           = models.FloatField(blank=True, null=True)
    last_donation_date  = models.DateTimeField(blank=True, null=True)
    cooldown_until      = models.DateTimeField(blank=True, null=True)
    is_verified         = models.BooleanField(default=False)
    fcm_token           = models.TextField(blank=True, null=True)
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'profiles'
        managed = IS_LOCAL_SQLITE

    def __str__(self):
        return f"{self.full_name} ({self.blood_group})"


class BloodRequest(models.Model):
    STATUS_CHOICES = [
        ('searching',      'Searching'),
        ('donor_accepted', 'Donor Accepted'),
        ('fulfilled',      'Fulfilled'),
        ('cancelled',      'Cancelled'),
        ('expired',        'Expired'),
    ]

    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester           = models.ForeignKey(DonorProfile, on_delete=models.CASCADE, related_name='blood_requests')
    blood_group         = models.CharField(max_length=10)
    units               = models.IntegerField(default=1)
    patient_name        = models.CharField(max_length=255, blank=True, null=True)
    hospital_name       = models.CharField(max_length=255)
    city                = models.CharField(max_length=255, blank=True, null=True)
    contact_phone       = models.CharField(max_length=20, blank=True, null=True)
    urgency_level       = models.CharField(max_length=20, blank=True, null=True)
    location            = models.TextField(blank=True, null=True)
    latitude            = models.FloatField(blank=True, null=True)
    longitude           = models.FloatField(blank=True, null=True)
    status              = models.CharField(max_length=20, choices=STATUS_CHOICES, default='searching')
    escalation_phase    = models.SmallIntegerField(default=1)
    notified_count      = models.IntegerField(default=0)
    confirmed_count     = models.IntegerField(default=0)
    donor_name          = models.CharField(max_length=255, blank=True, null=True)
    donor_phone         = models.CharField(max_length=20, blank=True, null=True)
    note                = models.TextField(blank=True, null=True)
    requester_relation  = models.CharField(max_length=50, blank=True, null=True)
    created_at          = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'blood_requests'
        managed = IS_LOCAL_SQLITE

    def __str__(self):
        return f"{self.blood_group} request at {self.hospital_name}"


class DonorResponse(models.Model):
    STATUS_CHOICES = [
        ('ACCEPTED',  'Accepted'),
        ('CONFIRMED', 'Confirmed'),
        ('ARRIVED',   'Arrived'),
        ('CANCELLED', 'Cancelled'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request         = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name='donor_responses', db_column='request_id')
    donor_id        = models.CharField(max_length=255)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACCEPTED')
    distance_meters = models.FloatField(null=True, blank=True)
    eta_minutes     = models.IntegerField(null=True, blank=True)
    responded_at    = models.DateTimeField(auto_now_add=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'donor_responses'
        managed = IS_LOCAL_SQLITE
        unique_together = [('request', 'donor_id')]

    def __str__(self):
        return f"Response by {self.donor_id} for {self.request_id}"
