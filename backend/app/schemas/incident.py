from datetime import datetime

from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    disaster_type: str
    severity: str = "low"

    latitude: float
    longitude: float

    location_name: str
    people_affected: int = Field(default=0, ge=0)


class IncidentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    severity: str | None = None
    status: str | None = None
    people_affected: int | None = Field(default=None, ge=0)


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    disaster_type: str
    severity: str
    latitude: float
    longitude: float
    location_name: str
    people_affected: int
    status: str
    reporter_id: int
    created_at: datetime

    class Config:
        from_attributes = True