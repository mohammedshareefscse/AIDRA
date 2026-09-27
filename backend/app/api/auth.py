from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from backend.app.core.security import (
    create_access_token,
    decode_access_token,
    verify_password,
)
from backend.app.database.database import get_db
from backend.app.models.user import User
from backend.app.schemas.user import (
    LoginRequest,
    UserCreate,
)
from backend.app.services.user_service import (
    create_user,
    get_user_by_email,
    get_user_by_id,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

security = HTTPBearer()


@router.post("/register")
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(
        db,
        user_data.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    if user_data.phone:
        existing_phone = (
            db.query(User)
            .filter(User.phone == user_data.phone)
            .first()
        )

        if existing_phone:
            raise HTTPException(
                status_code=400,
                detail="Phone number already registered",
            )

    user = create_user(
        db,
        user_data,
    )

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "email": user.email,
    }


@router.post("/login")
def login(
    user_data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(
        db,
        user_data.email,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    if not verify_password(
        user_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    try:
        payload = decode_access_token(
            credentials.credentials
        )

        user_id = int(
            payload["sub"]
        )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user = get_user_by_id(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }