from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.sos import SOS
from backend.app.schemas.sos import SOSCreate


def create_sos(
    db: Session,
    user_id: int,
    sos_data: SOSCreate,
) -> SOS:

    sos = SOS(
        user_id=user_id,
        latitude=sos_data.latitude,
        longitude=sos_data.longitude,
        message=sos_data.message,
        priority=sos_data.priority,
        status="pending",
    )

    db.add(sos)
    db.commit()
    db.refresh(sos)

    return sos


def get_all_sos(db: Session) -> list[SOS]:

    statement = select(SOS).order_by(SOS.id.desc())

    return list(
        db.scalars(statement).all()
    )


def get_sos_by_id(
    db: Session,
    sos_id: int,
) -> SOS | None:

    statement = select(SOS).where(
        SOS.id == sos_id
    )

    return db.scalar(statement)


def update_sos_status(
    db: Session,
    sos: SOS,
    status: str,
) -> SOS:

    sos.status = status

    db.commit()
    db.refresh(sos)

    return sos
