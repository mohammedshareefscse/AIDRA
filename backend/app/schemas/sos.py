from datetime import datetime

from pydantic import BaseModel, Field


class SOSCreate(BaseModel):
    latitude: float
    longitude: float
    message: str = Field(
        min_length=3,
        max_length=500,
    )
    priority: int = Field(
        default=1,
        ge=1,
        le=5,
    )


class SOSUpdate(BaseModel):
    status: str


class SOSResponse(BaseModel):
    id: int
    user_id: int
    latitude: float
    longitude: float
    message: str
    priority: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
