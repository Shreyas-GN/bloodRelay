from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class DonorProfile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True)
    full_name = Column(String)
    phone = Column(String)
    blood_group = Column(String)
    is_donor = Column(Boolean, default=True)
