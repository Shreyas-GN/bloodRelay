from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'blood_group', 'city', 
            'latitude', 'longitude', 'is_available_donor', 'last_donation_date',
            'date_joined'
        ]
        read_only_fields = ['id', 'username', 'last_donation_date', 'date_joined']

    def validate_phone_number(self, value):
        if value and (not value.isdigit() or len(value) != 10):
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value

    def validate_city(self, value):
        if value and len(value) < 3:
            raise serializers.ValidationError("City name must be at least 3 characters.")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'password', 'email', 'first_name', 'last_name',
            'phone_number', 'blood_group', 'city', 'latitude', 'longitude',
            'is_available_donor'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user

from .models import UserSettings

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
            'auto_disable_on_accept', 'auto_disable_after_donation',
            'notification_distance_km', 'emergency_types',
            'push_notifications', 'status_updates',
            'show_phone_number', 'share_location',
            'language', 'text_size',
            'is_paused'
        ]

