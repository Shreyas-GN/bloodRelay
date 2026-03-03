from rest_framework import serializers
from .models import BloodRequest, BloodBank
from django.contrib.auth import get_user_model

User = get_user_model()

class BloodBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodBank
        fields = ['id', 'name', 'city', 'phone_number', 'address', 'latitude', 'longitude', 'stock_status']

class RequesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number']

class BloodRequestSerializer(serializers.ModelSerializer):
    requester = RequesterSerializer(read_only=True)
    requester_id = serializers.IntegerField(source='requester.id', read_only=True)

    class Meta:
        model = BloodRequest
        fields = [
            'id', 'requester', 'requester_id', 'blood_group', 'units',
            'patient_name', 'hospital_name', 'city',
            'hospital_latitude', 'hospital_longitude',
            'contact_phone', 'requester_relation', 'urgency_level',
            'note', 'status',
            'created_at', 'updated_at', 'assigned_donor'
        ]
        read_only_fields = ['id', 'requester', 'requester_id', 'created_at', 'updated_at', 'status']

    def validate_contact_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value

    def validate_units(self, value):
        if value < 1 or value > 20:
            raise serializers.ValidationError("Units must be between 1 and 20.")
        return value

    def validate_patient_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Patient name must be at least 3 characters.")
        return value

    def validate_hospital_name(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Hospital name must be at least 3 characters.")
        return value



    def create(self, validated_data):
        # Automatically set the requester to the logged-in user
        if 'request' in self.context:
            validated_data['requester'] = self.context['request'].user
        return super().create(validated_data)

class BloodRequestDetailSerializer(serializers.ModelSerializer):
    requester = RequesterSerializer(read_only=True)
    assigned_donor = RequesterSerializer(read_only=True)
    
    class Meta:
        model = BloodRequest
        fields = '__all__'
