from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env', override=True)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Resolve absolute path to backend/db.sqlite3
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    db_path = project_root / "backend" / "db.sqlite3"
    DATABASE_URL = f"sqlite:///{db_path.as_posix()}"
    print(f"DATABASE_URL is not set. Falling back to local SQLite: {DATABASE_URL}")

# Check if using SQLite, requires different pool/check options
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
