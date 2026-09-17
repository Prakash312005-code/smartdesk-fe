import os

from dotenv import load_dotenv

from database.connection import SessionLocal, engine, Base
from models.admin import Admin
from services.auth_service import hash_password


load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

username = os.getenv("ADMIN_USERNAME")
password = os.getenv("ADMIN_PASSWORD")

db = SessionLocal()

try:
    existing_admin = db.query(Admin).filter(
        Admin.username == username
    ).first()

    if existing_admin:
        print("Admin already exists.")
    else:
        admin = Admin(
            username=username,
            hashed_password=hash_password(password)
        )

        db.add(admin)
        db.commit()

        print("Admin created successfully.")

finally:
    db.close()