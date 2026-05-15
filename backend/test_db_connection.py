import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        row = cursor.fetchone()
        print(f"DATABASE CONNECTION SUCCESSFUL: {row}")
except Exception as e:
    print(f"DATABASE CONNECTION FAILED: {e}")
