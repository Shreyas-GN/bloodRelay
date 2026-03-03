from django.contrib.auth import get_user_model
from math import radians, cos, sin, asin, sqrt

User = get_user_model()

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    return c * r

RARE_BLOOD_GROUPS = ['AB-', 'B-', 'O-']
DEFAULT_SEARCH_RADIUS_KM = 10
RARE_BLOOD_RADIUS_KM = 50

def is_rare_blood_group(blood_group):
    """Check if the blood group is considered rare."""
    return blood_group in RARE_BLOOD_GROUPS

def get_search_radius(blood_request):
    """
    Determine the search radius based on blood group rarity.
    """
    if blood_request.is_rare_blood or is_rare_blood_group(blood_request.blood_group):
        return RARE_BLOOD_RADIUS_KM
    return DEFAULT_SEARCH_RADIUS_KM

def get_matching_donors(blood_request, max_distance_km=50):
    """
    Find donors matching the blood group and within reasonable distance.
    
    Args:
        blood_request: BloodRequest instance
        max_distance_km: Maximum distance in kilometers (default: 50)
    
    Returns:
        List of User objects (donors) sorted by distance
    """
    # Find donors with matching blood group who are available
    matching_donors = User.objects.filter(
        blood_group=blood_request.blood_group,
        is_available_donor=True
    ).exclude(id=blood_request.requester.id).select_related('settings')
    
    # Calculate distance for each donor and filter by max distance AND user preference
    donors_with_distance = []
    
    is_rare = is_rare_blood_group(blood_request.blood_group) or getattr(blood_request, 'is_rare_blood', False)

    for donor in matching_donors:
        if donor.latitude and donor.longitude:
            distance = haversine_distance(
                float(blood_request.hospital_latitude),
                float(blood_request.hospital_longitude),
                float(donor.latitude),
                float(donor.longitude)
            )
            
            # 1. System Level Check
            # Determine effective max distance (override if rare)
            effective_radius = max_distance_km
            if is_rare:
                effective_radius = max(max_distance_km, RARE_BLOOD_RADIUS_KM)
            
            if distance > effective_radius:
                continue

            # 2. Donor Level Check (Feature 3: Proximity Limits)
            # If NOT rare blood, strictly respect donor's preferred distance
            if not is_rare:
                donor_limit = 50 # Default fallback
                if hasattr(donor, 'settings'):
                    donor_limit = donor.settings.notification_distance_km
                
                if distance > donor_limit:
                    continue

            # If we passed both checks, add to list
            donors_with_distance.append({
                'donor': donor,
                'distance_km': round(distance, 2)
            })
    
    # Sort by distance (closest first)
    donors_with_distance.sort(key=lambda x: x['distance_km'])
    
    # Return just the donor objects
    return [item['donor'] for item in donors_with_distance]

def get_donors_with_distance(blood_request, max_distance_km=50):
    """
    Similar to get_matching_donors but returns donor info with distance.
    Used for API responses.
    
    Returns:
        List of dictionaries with donor info and distance
    """
    matching_donors = User.objects.filter(
        blood_group=blood_request.blood_group,
        is_available_donor=True
    ).exclude(id=blood_request.requester.id).select_related('settings')
    
    donors_with_distance = []
    
    is_rare = is_rare_blood_group(blood_request.blood_group) or getattr(blood_request, 'is_rare_blood', False)

    for donor in matching_donors:
        if donor.latitude and donor.longitude:
            distance = haversine_distance(
                float(blood_request.hospital_latitude),
                float(blood_request.hospital_longitude),
                float(donor.latitude),
                float(donor.longitude)
            )
            
            # 1. System Level Check
            effective_radius = max_distance_km
            if is_rare:
                effective_radius = max(max_distance_km, RARE_BLOOD_RADIUS_KM)
            
            if distance > effective_radius:
                continue

            # 2. Donor Level Check
            if not is_rare:
                donor_limit = 50 # Default fallback
                if hasattr(donor, 'settings'):
                    donor_limit = donor.settings.notification_distance_km
                
                if distance > donor_limit:
                    continue

            donors_with_distance.append({
                'id': donor.id,
                'name': f"{donor.first_name} {donor.last_name}".strip() or donor.username,
                'blood_group': donor.blood_group,
                'city': donor.city,
                'phone_number': donor.phone_number,
                'distance_km': round(distance, 2)
            })
    
    # Sort by distance
    donors_with_distance.sort(key=lambda x: x['distance_km'])
    
    return donors_with_distance
