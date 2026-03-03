"""
Test script to debug authentication issues
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, UserSettings

# Check all users
print("=== ALL USERS ===")
for user in User.objects.all():
    print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Phone: '{user.phone_number}'")
    try:
        settings = user.settings
        print(f"  Settings: {settings}")
    except UserSettings.DoesNotExist:
        print(f"  No settings found")

# Check for empty phone numbers
print("\n=== USERS WITH EMPTY PHONE ===")
empty_phone_users = User.objects.filter(phone_number='')
print(f"Count: {empty_phone_users.count()}")
for user in empty_phone_users:
    print(f"  - {user.username} (ID: {user.id})")
