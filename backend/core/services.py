import requests
import os

class MatchingEngineClient:
    def __init__(self):
        # In Docker, we use the service name 'matching-engine'
        self.base_url = os.getenv('MATCHING_ENGINE_URL', 'http://matching-engine:9000')

    def trigger_matching(self, blood_request, latitude, longitude):
        """
        Calls the FastAPI matching engine to find donors for a request.
        """
        payload = {
            "blood_group": blood_request.blood_group,
            "latitude": latitude,
            "longitude": longitude,
            "hospital_name": blood_request.hospital_name,
            "units_required": blood_request.units,
            "request_id": str(blood_request.id),
        }
        
        try:
            response = requests.post(f"{self.base_url}/match-donors", json=payload, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error calling matching engine: {e}")
            return None
