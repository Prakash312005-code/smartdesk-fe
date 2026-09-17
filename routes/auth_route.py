import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from models.admin import Admin
from schemas.auth_schema import LoginRequest, TokenResponse
from services.auth_service import verify_password
from dotenv import load_dotenv

load_dotenv(override=True)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    admin = db.query(Admin).filter(
        Admin.username == login_data.username
    ).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not verify_password(
        login_data.password,
        admin.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")
    expire_minutes = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    expire_time = datetime.now(timezone.utc) + timedelta(
        minutes=expire_minutes
    )

    payload = {
        "sub": str(admin.id),
        "username": admin.username,
        "exp": expire_time
    }

    access_token = jwt.encode(
        payload,
        secret_key,
        algorithm=algorithm
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }