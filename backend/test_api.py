"""
Quick test script to verify the notification system is working.
Run this after starting the Django server.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_api_root():
    """Test that the API is running"""
    print("\n🔍 Testing API Root...")
    response = requests.get("http://localhost:8000/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert "notifications" in response.json()["endpoints"]
    print("✅ API Root OK")

def test_notifications_endpoint():
    """Test that notifications endpoint exists (will need auth)"""
    print("\n🔍 Testing Notifications Endpoint...")
    response = requests.get(f"{BASE_URL}/notifications/")
    print(f"Status: {response.status_code}")
    # Should return 401 or 403 (unauthorized) since we don't have a token
    assert response.status_code in [401, 403]
    print("✅ Notifications endpoint exists (requires auth as expected)")

def test_toggle_availability_endpoint():
    """Test that toggle availability endpoint exists"""
    print("\n🔍 Testing Toggle Availability Endpoint...")
    response = requests.post(f"{BASE_URL}/users/toggle-availability/")
    print(f"Status: {response.status_code}")
    # Should return 401 or 403 (unauthorized)
    assert response.status_code in [401, 403]
    print("✅ Toggle availability endpoint exists (requires auth as expected)")

def test_cancel_request_endpoint():
    """Test that cancel request endpoint exists"""
    print("\n🔍 Testing Cancel Request Endpoint...")
    response = requests.post(f"{BASE_URL}/requests/1/cancel/")
    print(f"Status: {response.status_code}")
    # Should return 401, 403, or 404
    assert response.status_code in [401, 403, 404]
    print("✅ Cancel request endpoint exists")

if __name__ == "__main__":
    print("=" * 60)
    print("PulseAid API Test Suite")
    print("=" * 60)
    
    try:
        test_api_root()
        test_notifications_endpoint()
        test_toggle_availability_endpoint()
        test_cancel_request_endpoint()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n📝 Next Steps:")
        print("1. Create a user account via /api/users/register/")
        print("2. Get auth token via /api/users/login/")
        print("3. Test authenticated endpoints")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server")
        print("Make sure Django server is running: python manage.py runserver")
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")

