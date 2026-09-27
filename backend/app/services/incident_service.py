from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.incident import Incident
from backend.app.schemas.incident import IncidentCreate, IncidentUpdate


def create_incident(
    db: Session,
    incident_data: IncidentCreate,
    reporter_id: int,
) -> Incident:

    incident = Incident(
        title=incident_data.title,
        description=incident_data.description,
        disaster_type=incident_data.disaster_type,
        severity=incident_data.severity,
        latitude=incident_data.latitude,
        longitude=incident_data.longitude,
        location_name=incident_data.location_name,
        people_affected=incident_data.people_affected,
        reporter_id=reporter_id,
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


def get_incidents(db: Session) -> list[Incident]:
    statement = select(Incident).order_by(Incident.id.desc())

    return list(db.scalars(statement).all())


def get_incident_by_id(
    db: Session,
    incident_id: int,
) -> Incident | None:

    statement = select(Incident).where(
        Incident.id == incident_id
    )

    return db.scalar(statement)


def update_incident(
    db: Session,
    incident: Incident,
    incident_data: IncidentUpdate,
) -> Incident:

    if incident_data.title is not None:
        incident.title = incident_data.title

    if incident_data.description is not None:
        incident.description = incident_data.description

    if incident_data.severity is not None:
        incident.severity = incident_data.severity

    if incident_data.status is not None:
        incident.status = incident_data.status

    if incident_data.people_affected is not None:
        incident.people_affected = incident_data.people_affected

    db.commit()
    db.refresh(incident)

    return incident


def delete_incident(
    db: Session,
    incident: Incident,
) -> None:

    db.delete(incident)
    db.commit()