from django.db import models
from django.conf import settings

class BloodBank(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    # Simple stock status simulation
    stock_status = models.JSONField(default=dict)  # e.g., {'A+': 'Available', 'O-': 'Critical'}

    def __str__(self):
        return f"{self.name} ({self.city})"

class BloodRequest(models.Model):
    class RequestStatus(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        SEARCHING = 'SEARCHING_FOR_DONORS', 'Searching for Donors'
        ACCEPTED = 'DONOR_ACCEPTED', 'Donor Accepted'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        EXPIRED = 'EXPIRED', 'Expired'
    
    class RequesterRelation(models.TextChoices):
        MYSELF = 'MYSELF', 'Myself'
        FAMILY = 'FAMILY', 'Family Member'
        FRIEND = 'FRIEND', 'Friend'
        OTHER = 'OTHER', 'Other'
    
    class UrgencyLevel(models.TextChoices):
        IMMEDIATE = 'IMMEDIATE', 'Immediate (next few hours)'
        TODAY = 'TODAY', 'Today'
    
    class BloodComponent(models.TextChoices):
        WHOLE_BLOOD = 'WHOLE_BLOOD', 'Whole Blood'
        PLATELETS = 'PLATELETS', 'Platelets'
        PLASMA = 'PLASMA', 'Plasma'

    # MUST-HAVE FIELDS
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='requests')
    blood_group = models.CharField(max_length=3)  # A+, O-, AB+, etc.
    units = models.PositiveIntegerField(default=1)  # 1-20
    
    patient_name = models.CharField(max_length=255)
    hospital_name = models.CharField(max_length=255)
    
    # Hospital Location
    hospital_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    hospital_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    city = models.CharField(max_length=100)  # Shown to user
    
    contact_phone = models.CharField(max_length=15)
    
    # Requester Relation (MUST-HAVE)
    requester_relation = models.CharField(
        max_length=20,
        choices=RequesterRelation.choices,
        default=RequesterRelation.MYSELF
    )
    
    # Urgency Level (MUST-HAVE)
    urgency_level = models.CharField(
        max_length=20,
        choices=UrgencyLevel.choices,
        default=UrgencyLevel.IMMEDIATE
    )
    is_assisted = models.BooleanField(default=False)
    
    # GOOD-TO-HAVE FIELDS (Optional)
    blood_component = models.CharField(
        max_length=20,
        choices=BloodComponent.choices,
        blank=True,
        null=True
    )
    is_rare_blood = models.BooleanField(default=False)
    department = models.CharField(max_length=100, blank=True)  # ICU, Emergency, etc.
    doctor_name = models.CharField(max_length=255, blank=True)
    case_reference = models.CharField(max_length=100, blank=True)
    required_by = models.DateTimeField(blank=True, null=True)  # Time picker
    note = models.TextField(blank=True, max_length=150)  # Max 150 chars for donor notes
    
    status = models.CharField(
        max_length=50, 
        choices=RequestStatus.choices, 
        default=RequestStatus.CREATED
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Assigned donor
    assigned_donor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_requests'
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['blood_group', 'city', 'status']),
            models.Index(fields=['urgency_level', 'created_at']),
        ]

    def __str__(self):
        return f"{self.blood_group} request at {self.hospital_name} ({self.status})"

class DonationFeedback(models.Model):
    request = models.OneToOneField(BloodRequest, on_delete=models.CASCADE, related_name='feedback')
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_feedback')
    message = models.TextField(default="Your donation helped someone today.")
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Feedback for Request #{self.request.id}"

class CityCoverage(models.Model):
    city_name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.city_name

    class Meta:
        verbose_name_plural = "City Coverages"

