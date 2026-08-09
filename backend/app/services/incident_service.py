from sqlalchemy.orm import Session

from app.database.models.incident import Incident
from app.database.models.user import User
from app.enums.incident_status import IncidentStatus
from app.repositories.incident_repository import IncidentRepository
from app.schemas.incident import (
    IncidentCreate,
    IncidentUpdate,
)

from fastapi import HTTPException, status


class IncidentService:

    def __init__(self):
        self.incident_repository = IncidentRepository()

    def create_incident(
        self,
        db: Session,
        incident_data: IncidentCreate,
        current_user: User,
    ) -> Incident:

        incident = Incident(
            title=incident_data.title,
            description=incident_data.description,
            severity=incident_data.severity,
            status=IncidentStatus.OPEN,
            created_by=current_user.id,
        )

        return self.incident_repository.create_incident(
            db,
            incident,
        )

    def get_incident_by_id(
        self,
        db: Session,
        incident_id: int,
    ) -> Incident:

        incident = self.incident_repository.get_incident_by_id(
            db,
            incident_id,
        )

        if incident is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found",
            )

        return incident

    def get_all_incidents(
        self,
        db: Session,
    ) -> list[Incident]:

        return self.incident_repository.get_all_incidents(db)

    def update_incident(
        self,
        db: Session,
        incident_id: int,
        incident_data: IncidentUpdate,
    ) -> Incident:

        incident = self.get_incident_by_id(
            db,
            incident_id,
        )

        ## we will not use this incident_data.model_dump() because it will return all the fields of the model, even if they are not set. We only want to update the fields that are set in the request body. So we will use exclude_unset=True to exclude the unset fields from the model_dump() method.
        update_data = incident_data.model_dump(
            exclude_unset=True, 
        )

        for key, value in update_data.items():
            setattr(
                incident,
                key,
                value,
            )

        return self.incident_repository.update_incident(
            db,
            incident,
        )

    def delete_incident(
        self,
        db: Session,
        incident_id: int,
    ) -> None:

        incident = self.get_incident_by_id(
            db,
            incident_id,
        )

        self.incident_repository.delete_incident(
            db,
            incident,
        )