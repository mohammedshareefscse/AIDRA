from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserUpdate
from backend.app.core.security import hash_password


def get_user_by_id(db: Session, user_id: int) -> User | None:
    statement = select(User).where(User.id == user_id)
    return db.scalar(statement)


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return db.scalar(statement)


def get_users(db: Session) -> list[User]:
    statement = select(User).order_by(User.id)
    return list(db.scalars(statement).all())


def create_user(db: Session, user_data: UserCreate) -> User:
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user(
    db: Session,
    user: User,
    user_data: UserUpdate,
) -> User:
    if user_data.full_name is not None:
        user.full_name = user_data.full_name

    if user_data.phone is not None:
        user.phone = user_data.phone

    db.commit()
    db.refresh(user)

    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
    
