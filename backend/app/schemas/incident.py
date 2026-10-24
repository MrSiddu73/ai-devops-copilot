
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.enums.incident_severity import IncidentSeverity
from app.enums.incident_status import IncidentStatus


class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: IncidentSeverity


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: IncidentSeverity
    status: IncidentStatus
    created_by: int
    assigned_to: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[IncidentSeverity] = None
    status: Optional[IncidentStatus] = None
    assigned_to: Optional[int] = None


class IncidentListResponse(BaseModel):
    items: list[IncidentResponse]
    total: int
    skip: int
    limit: int
