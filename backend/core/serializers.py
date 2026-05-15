from rest_framework import serializers
from .models import DonorProfile, BloodRequest

class DonorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorProfile
        fields = '__all__'

class BloodRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodRequest
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'notified_count', 'escalation_phase')
