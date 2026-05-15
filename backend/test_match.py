import requests

payload = {
    "blood_group": "O+",
    "latitude": 12.9716,
    "longitude": 77.5946
}

response = requests.post(
    "http://127.0.0.1:9000/match-donors",
    json=payload
)

print(response.json())