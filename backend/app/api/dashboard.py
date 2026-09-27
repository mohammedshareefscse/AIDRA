from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.core.security import decode_access_token
from backend.app.database.database import get_db
from backend.app.models.incident import Incident
from backend.app.models.sos import SOS


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
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
        from fastapi import HTTPException

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )


@router.get("/stats")
def dashboard_stats(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):

    total_incidents = db.scalar(
        select(func.count(Incident.id))
    ) or 0

    high_risk_incidents = db.scalar(
        select(func.count(Incident.id)).where(
            Incident.risk_level.in_(["high", "critical"])
        )
    ) or 0

    total_people_affected = db.scalar(
        select(func.coalesce(func.sum(Incident.people_affected), 0))
    ) or 0

    total_sos = db.scalar(
        select(func.count(SOS.id))
    ) or 0

    pending_sos = db.scalar(
        select(func.count(SOS.id)).where(
            SOS.status == "pending"
        )
    ) or 0

    responding_sos = db.scalar(
        select(func.count(SOS.id)).where(
            SOS.status == "responding"
        )
    ) or 0

    return {
        "total_incidents": total_incidents,
        "high_risk_incidents": high_risk_incidents,
        "total_people_affected": total_people_affected,
        "total_sos": total_sos,
        "pending_sos": pending_sos,
        "responding_sos": responding_sos,
    }
