from sqlalchemy.orm import Session

from app.database.models.incident import Incident
from app.enums.incident_status import IncidentStatus
from app.enums.incident_severity import IncidentSeverity

class IncidentRepository:

    def create_incident(
        self,
        db: Session,
        incident: Incident,
    ) -> Incident:
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident

    def get_incident_by_id(
        self,
        db: Session,
        incident_id: int,
    ) -> Incident | None:
        return (
            db.query(Incident)
            .filter(Incident.id == incident_id)
            .first()
        )

    def get_all_incidents(
        self,
        db: Session,
        status: IncidentStatus | None = None,
        severity: IncidentSeverity | None = None,
        assigned_to: int | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> list[Incident]:

        query = db.query(Incident)

        if status is not None:
            query = query.filter(Incident.status == status)

        if severity is not None:
            query = query.filter(Incident.severity == severity)

        if assigned_to is not None:
            query = query.filter(Incident.assigned_to == assigned_to)
        return (
            query
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_incident(
        self,
        db: Session,
        incident: Incident,
    ) -> Incident:
        db.commit()
        db.refresh(incident)
        return incident

    def delete_incident(
        self,
        db: Session,
        incident: Incident,
    ) -> None:
        db.delete(incident)
        db.commit()