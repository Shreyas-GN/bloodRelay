"""
Test the settings endpoint with a mock Clerk token
"""
import requests

# Test the settings endpoint
url = "http://localhost:8000/api/users/settings/"

# Try without authentication (should get 403)
print("=== Testing without auth ===")
response = requests.get(url)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:200]}")

print("\n=== Testing profile endpoint ===")
profile_url = "http://localhost:8000/api/users/profile/"
response = requests.get(profile_url)
print(f"Status: {response.status_code}")
print(f"Response: {response.text[:200]}")
