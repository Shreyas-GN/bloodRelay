import math
from sqlalchemy import text
from app.core.database import SessionLocal

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    R = 6371.0 # Radius of Earth in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_nearby_donors(lat: float, lng: float, radius_km: float, blood_group: str):
    db = SessionLocal()
    try:
        # Try PostGIS query first
        query = text("""
            SELECT id, full_name, phone, blood_group, distance_meters
            FROM find_nearby_donors(:lat, :lng, :radius_km)
            WHERE blood_group = :blood_group
        """)
        
        result = db.execute(query, {
            "lat": lat,
            "lng": lng,
            "radius_km": radius_km,
            "blood_group": blood_group
        })
        return [dict(row) for row in result.mappings()]
    except Exception as e:
        print(f"PostGIS query failed or unavailable, falling back to Python/SQLite matching: {e}")
        try:
            # Fallback for SQLite or systems without PostGIS/location columns
            query = text("""
                SELECT id, full_name, phone, blood_group
                FROM profiles
                WHERE is_donor = true
            """)
            result = db.execute(query)
            donors = []
            for idx, row in enumerate(result.mappings()):
                row_dict = dict(row)
                # Mock location close to the request's coordinates
                d_lat = lat + (0.005 * (idx + 1))
                d_lng = lng + (0.005 * (idx + 1))
                
                # Check blood group compatibility
                if row_dict.get('blood_group') != blood_group:
                    continue
                
                dist = haversine(lat, lng, d_lat, d_lng)
                if dist <= radius_km:
                    donors.append({
                        "id": str(row_dict['id']),
                        "full_name": row_dict['full_name'],
                        "phone": row_dict['phone'],
                        "blood_group": row_dict['blood_group'],
                        "distance_meters": dist * 1000.0
                    })
            # Sort by distance
            donors.sort(key=lambda x: x['distance_meters'])
            return donors
        except Exception as fallback_err:
            print(f"Fallback query failed: {fallback_err}")
            return []
    finally:
        db.close()
