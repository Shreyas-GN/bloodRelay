from app.core.database import SessionLocal
from app.models.donor import DonorProfile

db = SessionLocal()

try:
    donors = db.query(DonorProfile).all()

    print(donors)

except Exception as e:
    print(e)
