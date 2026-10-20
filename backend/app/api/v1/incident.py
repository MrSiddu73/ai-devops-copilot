from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.models.user import User
from app.database.session import get_db
from fastapi import APIRouter, Depends, Query, status   
from app.enums.incident_status import IncidentStatus
from app.enums.incident_severity import IncidentSeverity

from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentUpdate,
    IncidentListResponse,
)

from app.services.incident_service import IncidentService

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"],
)

incident_service = IncidentService()
@router.post(
    "/",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return incident_service.create_incident(
        db,
        incident,
        current_user,
    )

@router.get(
    "/",
    response_model=IncidentListResponse,
)
def get_all_incidents(
    status: IncidentStatus | None = None,
    severity: IncidentSeverity | None = None,
    assigned_to: int | None = None,
    skip: int = Query(
        0,
        ge=0,
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    incidents, total = incident_service.get_all_incidents(
    db,
    status=status,
    severity=severity,
    assigned_to=assigned_to,
    skip=skip,
    limit=limit,
)

    return IncidentListResponse(
        items=incidents,
        total=total,
        skip=skip,
        limit=limit,
    )

@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return incident_service.get_incident_by_id(
        db,
        incident_id,
    )

@router.patch(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def update_incident(
    incident_id: int,
    incident: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return incident_service.update_incident(
        db,
        incident_id,
        incident,
    )

@router.delete(
    "/{incident_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident_service.delete_incident(
        db,
        incident_id,
    )