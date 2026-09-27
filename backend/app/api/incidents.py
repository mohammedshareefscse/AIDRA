from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentUpdate,
)
from backend.app.services.incident_service import (
    create_incident,
    get_incidents,
    get_incident_by_id,
    update_incident,
    delete_incident,
)
from backend.app.core.security import decode_access_token


router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"],
)

security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:

    try:
        payload = decode_access_token(credentials.credentials)
        return int(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


@router.post(
    "",
    response_model=IncidentResponse,
)
def create_new_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):

    return create_incident(
        db,
        incident_data,
        user_id,
    )


@router.get(
    "",
    response_model=list[IncidentResponse],
)
def list_incidents(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):

    return get_incidents(db)


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def get_single_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):

    incident = get_incident_by_id(
        db,
        incident_id,
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return incident


@router.patch(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def update_existing_incident(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):

    incident = get_incident_by_id(
        db,
        incident_id,
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    return update_incident(
        db,
        incident,
        incident_data,
    )


@router.delete("/{incident_id}")
def remove_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):

    incident = get_incident_by_id(
        db,
        incident_id,
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found",
        )

    delete_incident(db, incident)

    return {
        "message": "Incident deleted successfully"
    }