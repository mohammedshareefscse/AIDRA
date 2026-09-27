from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from backend.app.core.security import decode_access_token
from backend.app.database.database import get_db
from backend.app.schemas.sos import SOSCreate, SOSResponse, SOSUpdate
from backend.app.services.sos_service import (
    create_sos,
    get_all_sos,
    get_sos_by_id,
    update_sos_status,
)


router = APIRouter(
    prefix="/sos",
    tags=["SOS Emergency"],
)

security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:

    try:
        payload = decode_access_token(
            credentials.credentials
        )

        return int(payload["sub"])

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


@router.post(
    "",
    response_model=SOSResponse,
)
def create_emergency_sos(
    sos_data: SOSCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return create_sos(
        db=db,
        user_id=user_id,
        sos_data=sos_data,
    )


@router.get(
    "",
    response_model=list[SOSResponse],
)
def list_sos(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return get_all_sos(db)


@router.get(
    "/{sos_id}",
    response_model=SOSResponse,
)
def get_sos(
    sos_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    sos = get_sos_by_id(
        db=db,
        sos_id=sos_id,
    )

    if not sos:
        raise HTTPException(
            status_code=404,
            detail="SOS request not found",
        )

    return sos


@router.patch(
    "/{sos_id}",
    response_model=SOSResponse,
)
def update_sos(
    sos_id: int,
    sos_data: SOSUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    sos = get_sos_by_id(
        db=db,
        sos_id=sos_id,
    )

    if not sos:
        raise HTTPException(
            status_code=404,
            detail="SOS request not found",
        )

    return update_sos_status(
        db=db,
        sos=sos,
        status=sos_data.status,
    )
