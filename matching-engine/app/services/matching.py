from sqlalchemy import text
from app.core.database import SessionLocal

def get_nearby_donors(lat: float, lng: float, radius_km: float, blood_group: str):
    db = SessionLocal()
    try:
        # Use the PostGIS function find_nearby_donors defined in supabase_setup.sql
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
        
        # In SQLAlchemy 2.0, result.mappings() is the best way to get dicts
        return [dict(row) for row in result.mappings()]
    finally:
        db.close()
